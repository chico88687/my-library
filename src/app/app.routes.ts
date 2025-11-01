import {Routes} from '@angular/router';
import {UserSettingsGuard} from './core/user-access.service';
import {SetUpUserComponent} from './set-up-user/set-up-user.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [UserSettingsGuard],
    loadChildren: () => import('./pages/pages.routes'),
  },
  {
    path: 'set-up-user',
    component: SetUpUserComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
