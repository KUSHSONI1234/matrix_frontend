import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule,RouterLink],
})
export class LoginComponent implements OnInit {
  @ViewChild('usernameInput') usernameInputRef!: ElementRef;

  user = { username: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Directly focus without delay unless slow render
    requestAnimationFrame(() => {
      this.usernameInputRef?.nativeElement.focus();
    });
  }

  onSubmit() {
    const { username, password } = this.user;

    if (!username.trim() || !password.trim()) {
      this.showError('Please enter both username and password.');
      return;
    }

    this.authService.login(this.user).subscribe({
      next: ({ token }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);

        this.router.navigate(['/menu']);
      },
      error: (err) => {
        const message =
          err.status === 500
            ? 'Server error. Please try again later.'
            : 'Login Failed: Invalid credentials.';
        this.showError(message);
      },
    });
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = ''), 4000);
  }
}
