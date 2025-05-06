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
  

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Focus the username input field on page load
    setTimeout(() => this.usernameInputRef?.nativeElement.focus(), 500);
  }

  onSubmit() {
    if (!this.user.username.trim() || !this.user.password.trim()) {
      this.successMessage = '';
      this.errorMessage = ' Please enter both username and password.';
      this.clearMessages();
      return;
    }

    this.authService.login(this.user).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        // this.sharedService.setUsername(this.username);  
        localStorage.setItem('username', this.user.username);

        this.successMessage = ' Login Successful!';
        this.errorMessage = '';
        this.clearMessages();
        setTimeout(() => {
          this.router.navigate(['/menu']);
        }, 1500);
      },
      error: (err) => {
        this.successMessage = '';
        if (err.status === 500) {
          this.errorMessage = ' Server error. Please try again later.';
        } else {
          this.errorMessage = ' Login Failed: Invalid credentials.';
        }
        this.clearMessages();
      }
    });
  }

  clearMessages() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }
}
