import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedPages = JSON.parse(localStorage.getItem('allowedPages') || '[]');
    const path = route.routeConfig?.path;

    const routeNameMap: any = {
      'dashboard': 'Department',
      'shift': 'Shift Configuration',
      'user-management': 'User Management'
    };
    

    const requiredPage = routeNameMap[path || ''];

    if (allowedPages.includes(requiredPage)) {
      return true;
    }

    alert('Access Denied');
    this.router.navigate(['/menu']);
    return false;
  }
}
