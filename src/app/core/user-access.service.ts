// user-settings.guard.ts
import {inject, Injectable} from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {UserSettingsService} from '../service/database/user-settings.service';

@Injectable({ providedIn: 'root' })
export class UserSettingsGuard  implements CanActivate {

  private readonly userSettingsService: UserSettingsService = inject(UserSettingsService);
  private readonly router: Router = inject(Router);

  async canActivate(): Promise<boolean> {
    const hasUser = await this.userSettingsService.getUser();
    if (!hasUser) {
      await this.router.navigate(['/update-user-settings']);
      return false;
    }
    return true;
  }
}
