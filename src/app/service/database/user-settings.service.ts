import { Injectable } from '@angular/core';
import {DexieService} from '../../database/dexie.service';
import {UserSettings} from '../../database/tables/user-settings';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  constructor(private readonly db: DexieService) {}

  /** Returns the single user or undefined if not found */
  getUser() {
    return this.db.userSettings.toCollection().first();
  }

  /** Adds a user but throws if one already exists */
  addUser(user: Omit<UserSettings, 'id'>) {
    return this.db.userSettings
      .toCollection()
      .first()
      .then(existingUser => {
        if (existingUser) {
          throw new Error('A user already exists in the database.');
        }
        return this.db.userSettings.add(user);
      });
  }

  /** Updates the existing user; throws if none exists */
  updateUser(changes: Partial<UserSettings>) {
    return this.db.userSettings
      .toCollection()
      .first()
      .then(existingUser => {
        if (existingUser?.id === undefined) {
          throw new Error('No existing user to update.');
        }
        return this.db.userSettings.update(existingUser.id, changes);
      });
  }
}
