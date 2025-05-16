import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  imports: [CommonModule, FormsModule, RouterLink],
})
export class MenuComponent implements OnInit {
  allowedPages: Set<string> = new Set();
  username: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';

    if (!this.username) return;

    this.authService.getAccessiblePages(this.username).subscribe((pages) => {
      this.allowedPages = new Set(pages);
      localStorage.setItem('allowedPages', JSON.stringify(pages));
    });
  }

  canShow(page: string): boolean {
    return this.allowedPages.has(page);
  }
}
