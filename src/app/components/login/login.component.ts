import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule,RouterLink]
})
export class LoginComponent implements OnInit {
  @ViewChild('usernameInput') usernameInputRef!: ElementRef;

  user = { username: '', password: '' };
  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    setTimeout(() => this.usernameInputRef?.nativeElement.focus(), 300);
  }

  onSubmit() {
    if (!this.user.username.trim() || !this.user.password.trim()) {
      this.errorMessage = 'Please enter both username and password.';
      this.clearMessages();
      return;
    }

    this.loading = true;

    this.authService.login(this.user).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', this.user.username);

        this.router.navigate(['/menu']); // Navigate immediately
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = 'Login Failed: Invalid credentials.';
        }
        this.clearMessages();
      }
    });
  }

  clearMessages() {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 4000);
  }
}

