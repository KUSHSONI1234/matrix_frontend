import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule,RouterLink],
})
export class RegisterComponent implements OnInit, AfterViewInit {
  @ViewChild('usernameInput') usernameInputRef!: ElementRef;

  user = { username: '', password: '' };
  successMessage = '';
  errorMessage = '';
  formDataList: any[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Fetch form data (if needed)
    this.authService.getFormData().subscribe({
      next: (data) => {
        this.formDataList = data;
        setTimeout(() => this.usernameInputRef?.nativeElement.focus(), 500);
      },
      error: () => {
        this.errorMessage = 'Failed to fetch data.';
      },
    });
  }

  ngAfterViewInit(): void {
    // Ensure that focus is set on the username input field after the view is initialized
    setTimeout(() => {
      this.usernameInputRef?.nativeElement.focus();
    }, 0);
  }

  onSubmit(): void {
    if (!this.user.username.trim() || !this.user.password.trim()) {
      this.successMessage = '';
      this.errorMessage = 'Please fill in all details.';
      this.clearMessages();
      return;
    }

    this.authService.register(this.user).subscribe({
      next: () => {
        this.successMessage = 'Registered Successfully!';
        this.errorMessage = '';
        this.clearMessages();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: () => {
        this.successMessage = '';
        this.errorMessage = 'Registration Failed. Please try again.';
        this.clearMessages();
      },
    });
  }

  clearMessages(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }
}
