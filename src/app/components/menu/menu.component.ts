import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  allowedPages: string[] = [];
  username: string = localStorage.getItem("username") || '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const username = localStorage.getItem("username");

    if (username) {
      this.authService.getAccessiblePages(username).subscribe((pages) => {
        this.allowedPages = pages; // ✅ Set local variable
        localStorage.setItem("allowedPages", JSON.stringify(pages));
      });
    }
  }

  canShow(page: string): boolean {
    return this.allowedPages.includes(page);
  }
}
