import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: { username: string }[] = [];
  selectedUsername: string = '';
  selectedUser: any = null;

  pageRight = {
    username: '',
    name: '',
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  };

  pages = [
    { name: 'Department', edit: false, view: false, delete: false, add: false },
    {
      name: 'Shift Configuration',
      edit: false,
      view: false,
      delete: false,
      add: false,
    },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    const url = 'http://192.168.28.44:5000/api/Auth';
    this.http.get<{ username: string }[]>(url).subscribe(
      (response) => {
        this.users = response;

        // ✅ Auto-select the first user
        if (this.users.length > 0) {
          this.onUserSelect(this.users[0]);
        }
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  // When a user row is clicked
  onUserSelect(user: any): void {
    this.selectedUser = user;
    this.selectedUsername = user.username; // ✅ This ensures disabling works

    this.http
      .get<any[]>(`http://192.168.28.44:5038/api/pageRights/${user.username}`)
      .subscribe({
        next: (rights) => {
          this.pages.forEach((page) => {
            page.edit = false;
            page.view = false;
            page.delete = false;
            page.add = false;
          });

          rights.forEach((right) => {
            const page = this.pages.find((p) => p.name === right.name);
            if (page) {
              page.edit = right.edit;
              page.view = right.view;
              page.delete = right.delete;
              page.add = right.add;
            }
          });
        },
        error: (err) => {
          console.error('Error loading user rights:', err);
          alert('Failed to load user rights.');
        },
      });
  }

  // Save page rights to backend
  saveRights() {
    if (!this.selectedUser) {
      alert('Please select a user first.');
      return;
    }

    const rightsPayload = this.pages.map((page) => ({
      username: this.selectedUser.username,
      name: page.name,
      edit: page.edit || false,
      view: page.view || false,
      delete: page.delete || false,
      add: page.add || false,
    }));

    this.http
      .post('http://192.168.28.44:5038/api/PageRights', rightsPayload)
      .subscribe({
        next: () => {
          alert('Rights saved successfully!');
          this.resetBtn();
        },
        error: (err) => {
          console.error('Error saving rights:', err);
          alert('Failed to save rights. Check console for error details.');
        },
      });
  }

  resetBtn(): void {
    this.pageRight = {
      username: '',
      name: '',
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    };

    this.pages.forEach((page) => {
      page.edit = false;
      page.view = false;
      page.delete = false;
      page.add = false;
    });

    this.selectedUser = null;
    this.selectedUsername = '';
  }
}
