import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, FormsModule, RouterLink],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  formData = this.getEmptyFormData();
  users: any[] = [];
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];
  suggestions: any[] = [];

  successMessage: string = '';
  errorMessage: string = '';

  searchTerm = '';
  idInput = '';
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  rights: any = {};
  username: string = ''; // load from token or session

  @ViewChild('idInputRef') idInputElement!: ElementRef;
  @ViewChild('nameInputRef') nameInputElement!: ElementRef;

  isNewMode = false;
  isEditMode = false;

  private apiUrl = 'http://192.168.28.44:5002/api/formdata';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
      this.authService.getPageRights(this.username).subscribe((data) => {
      const deptRights = data.find((r: any) => r.name.toLowerCase() === 'department');
      this.rights = deptRights || {};
      this.authService.setRights('department', this.rights);
    });
    if (this.validateToken()) {
      this.getUsers();
      setTimeout(() => this.idInputElement?.nativeElement.focus(), 500);
    }
  }

  canView() {
    return this.rights.view;
  }

  canAdd() {
    return this.rights.add;
  }

  canEdit() {
    return this.rights.edit;
  }

  canDelete() {
    return this.rights.delete;
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.idInputElement?.nativeElement.focus();
    });
  }

  validateToken(): boolean {
    const token = this.authService.getToken();
    if (!token) {
      this.showMessage('Session expired. Please log in again.');
      this.logout();
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        this.showMessage('Session expired. Please log in again.');
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Token parsing error:', error);
      this.logout();
      return false;
    }

    return true;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUsers(): void {
    if (!this.validateToken()) return;

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (res) => {
        this.users = res;
        this.filteredUsers = [...res];
        this.updatePaginatedUsers();
      },
      error: (err) => this.handleApiError(err),
    });
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000); // Hide after 3 seconds
  }

  showErrorMessage(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 4000); // Hide after 4 seconds
  }

  onSubmit(): void {
    if (!this.validateToken()) return;

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const isCreate = this.formData.id === 0;
    const url = isCreate ? this.apiUrl : `${this.apiUrl}/${this.formData.id}`;
    const request = isCreate
      ? this.http.post(url, this.formData, { headers, responseType: 'text' })
      : this.http.put(url, this.formData, { headers, responseType: 'text' });

    request.subscribe({
      next: () => {
        this.getUsers();
        this.resetForm();
        this.showSuccessMessage(
          isCreate ? 'Form created successfully!' : 'Form updated successfully!'
        );
      },
      error: (err) => {
        this.handleApiError(err);
        this.showErrorMessage('Failed to submit the form. Please try again.');
      },
    });

    this.isEditMode = false;
    this.isNewMode = false;
  }

  deleteUser(id: number): void {
    if (!this.validateToken()) return;

    const confirmed = confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .delete(`${this.apiUrl}/${id}`, { headers, responseType: 'text' })
      .subscribe({
        next: () => {
          this.showMessage('User deleted successfully!');
          this.getUsers();
        },
        error: (err) => this.handleApiError(err),
      });
  }

  selectRow(user: any): void {
    if (!this.canEdit()) return;
    this.isNewMode = true;
    this.isEditMode = true;

    this.formData = { ...user };
    this.idInput = user.id.toString();

    // focus on name field if needed
    setTimeout(() => {
      this.nameInputElement?.nativeElement.focus();
    }, 100);
  }

  resetForm(): void {
    this.formData = this.getEmptyFormData();
    this.idInput = '';
    this.suggestions = [];
  }

  getEmptyFormData(): any {
    return {
      id: 0,
      name: '',
      email: '',
      code: '',
      setAsDefault: false,
      shortName: '',
      description: '',
    };
  }

  onIdInputChange(): void {
    this.suggestions = this.users.filter((user) =>
      user.id.toString().startsWith(this.idInput)
    );
  }

  selectSuggestion(suggestion: any): void {
    this.formData = { ...suggestion };
    this.idInput = suggestion.id.toString();
    this.suggestions = [];
  }

  onKeyDown(event: KeyboardEvent): void {
    // this.isEditMode=false;
    if (
      (event.key === 'Enter' || event.key === 'Tab') &&
      this.suggestions.length > 0
    ) {
      this.isEditMode = true;
      this.isNewMode = true;
      event.preventDefault();
      this.selectSuggestion(this.suggestions[0]);
    }
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = term
      ? this.users.filter((user) => user.name.toLowerCase().includes(term))
      : [...this.users];
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(
      start,
      start + this.itemsPerPage
    );
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedUsers();
    }
  }

  refreshBtn(): void {
    window.location.reload();
    this.getUsers();
    this.resetForm();
    this.isNewMode = false;

    setTimeout(() => {
      this.idInputElement?.nativeElement.focus();
    });
  }

  newBtn(): void {
    this.isNewMode = true;
    this.isEditMode = false;
    this.resetForm();

    setTimeout(() => {
      this.nameInputElement?.nativeElement.focus();
    }, 100);
  }

  // Reusable alert method
  showMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private handleApiError(error: any): void {
    console.error('API Error:', error);
    if (error.status === 401) {
      this.showMessage('Unauthorized or session expired. Please log in again.');
      this.logout();
    } else {
      this.showMessage('❌ An error occurred. Please try again later.');
    }
  }
}
