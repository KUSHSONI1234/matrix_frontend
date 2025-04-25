import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './components/auth.guard';
import { MenuComponent } from './components/menu/menu.component';
import { ShiftComponent } from './components/shift/shift.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
// import { MenuComponent } from './components/menu/menu.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'menu', component: MenuComponent },
  { path: 'shift', component: ShiftComponent },
  {
    path:'user-management',component:UserManagementComponent
  },
  { path: '**', redirectTo: '/login' }
];
