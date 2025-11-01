import { Routes } from '@angular/router';
import {UserSettingsGuard} from './core/user-access.service';
import {UpdateUserSettingsComponent} from './pages/update-user-settings/update-user-settings.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [UserSettingsGuard],
    loadChildren: () => import('./pages/pages.routes'),
  },
  {
    path: 'update-user-settings',
    component: UpdateUserSettingsComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
