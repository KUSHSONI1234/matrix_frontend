import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit, AfterViewInit {
  // users: { username: string }[] = [];
  selectedUsername: string = '';
  selectedUser: any = null;
  user = { username: '', password: '' };
  successMessage = '';
  errorMessage = '';
  rights: any = {};
  username: string = '';
  isSuperAdmin: boolean = false;
  searchTerm: string = '';
  users: any[] = []; // all users
  filteredUsers: any[] = []; // filtered users to display
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  paginatedUsers: any[] = [];

  @ViewChild('usernameInput') usernameInputRef!: ElementRef;

  pages = [
    { name: 'Department', edit: false, view: false, delete: false, add: false },
    {
      name: 'Shift Configuration',
      edit: false,
      view: false,
      delete: false,
      add: false,
    },
    {
      name: 'User Management',
      edit: false,
      view: false,
      delete: false,
      add: false,
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    this.isSuperAdmin = this.username === 'sa';

    if (this.username) {
      this.authService.getPageRights(this.username).subscribe((data) => {
        const userMgmtRights = data.find(
          (r: any) => r.name.toLowerCase() === 'user management'
        );
        this.rights = userMgmtRights || {};
      });
    }

    if (this.validateToken()) {
      this.getUsers(); // ✅ getUsers() will now update filteredUsers
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usernameInputRef?.nativeElement.focus();
    }, 300);
  }

  validateToken(): boolean {
    return true;
  }

  getUsers(): void {
    const url = 'http://192.168.28.44:5000/api/Auth';
    this.http.get<{ username: string }[]>(url).subscribe({
      next: (response) => {
        this.users = response;
        this.filteredUsers = [...this.users];
        this.updatePaginatedUsers();
        if (this.users.length > 0) {
          this.onUserSelect(this.users[0]);
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        alert('Failed to load users.');
      },
    });
  }

  onUserSelect(user: any): void {
    this.selectedUser = user;
    this.selectedUsername = user.username;

    this.http
      .get<any[]>(`http://192.168.28.44:5038/api/pageRights/${user.username}`)
      .subscribe({
        next: (rights) => {
          this.pages.forEach((page) => {
            const match = rights.find((r) => r.name === page.name);
            page.edit = match?.edit || false;
            page.view = match?.view || false;
            page.delete = match?.delete || false;
            page.add = match?.add || false;
            // this.getUsers();
          });
        },
        error: (err) => {
          console.error('Error loading user rights:', err);
          alert('Failed to load user rights.');
        },
      });
  }

  saveRights(): void {
    if (!this.selectedUser) {
      alert('Please select a user first.');
      return;
    }

    const rightsPayload = this.pages.map((page) => ({
      username: this.selectedUser.username,
      name: page.name,
      edit: !!page.edit,
      view: !!page.view,
      delete: !!page.delete,
      add: !!page.add,
    }));

    this.http
      .post('http://192.168.28.44:5038/api/PageRights', rightsPayload)
      .subscribe({
        next: () => {
          alert('Rights saved successfully!');
        },
        error: (err) => {
          console.error('Error saving rights:', err);
          alert('Failed to save rights.');
        },
      });
  }

  deleteUser(username: string): void {
    if (confirm(`Are you sure you want to delete '${username}'?`)) {
      this.authService.deleteUser(username).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.username !== username);
          if (this.selectedUsername === username) {
            this.selectedUser = null;
            this.selectedUsername = '';
            this.getUsers();
          }
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('User deletion failed.');
        },
      });
    }
  }

  onSubmit(): void {
    if (!this.user.username.trim() || !this.user.password.trim()) {
      this.errorMessage = 'Please fill in all details.';
      this.successMessage = '';
      this.clearMessages();
      return;
    }
  
    this.authService.register(this.user).subscribe({
      next: () => {
        this.successMessage = 'Registered Successfully!';
        this.errorMessage = '';
  
        const newUser = { username: this.user.username };
        this.users.push(newUser);
        this.selectedUser = newUser;
        this.selectedUsername = newUser.username;
  
        // ✅ Set default rights for Department and Shift Configuration
        const defaultRights = [
          {
            username: newUser.username,
            name: 'Department',
            view: true,
            edit: false,
            delete: false,
            add: false,
          },
          {
            username: newUser.username,
            name: 'Shift Configuration',
            view: true,
            edit: false,
            delete: false,
            add: false,
          },
        ];
  
        // 🔁 Post these default rights to the API
        this.http
          .post('http://192.168.28.44:5038/api/PageRights', defaultRights)
          .subscribe({
            next: () => {
              console.log('Default rights saved.');
              this.getUsers();
            },
            error: (err) => {
              console.error('Error saving default rights:', err);
            },
          });
  
        this.resetRights(); // Clear the UI checkboxes
        this.user = { username: '', password: '' };
        setTimeout(() => this.usernameInputRef?.nativeElement.focus(), 0);
        this.clearMessages();
      },
      error: () => {
        this.successMessage = '';
        this.errorMessage = 'Username already exists.';
        this.clearMessages();
      },
    });
  }
  

  resetRights(): void {
    this.pages.forEach((page) => {
      page.edit = false;
      page.view = false;
      page.delete = false;
      page.add = false;
    });
  }

  resetBtn(): void {
    this.selectedUser = null;
    this.selectedUsername = '';
    this.resetRights();
  }

  clearMessages(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  canView(): boolean {
    return this.rights?.view;
  }

  canAdd(): boolean {
    return this.rights?.add;
  }

  canEdit(): boolean {
    return this.pages.some((page) => page.edit);
  }

  canDelete(): boolean {
    return this.rights?.delete;
  }

  canEditRights(): boolean {
    return this.isSuperAdmin || this.rights?.edit;
  }

  newBtn() {
    setTimeout(() => {
      this.usernameInputRef?.nativeElement.focus();
    }, 300);
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = term
      ? this.users.filter((user) => user.username.toLowerCase().includes(term))
      : [...this.users]; // Reset if empty search
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

  reset() {
    (this.user.username = ''), (this.user.password = '');
  }
}
