import {inject, Injectable, signal} from '@angular/core';
import {DexieService} from '../../database/dexie.service';
import {UserSettings} from '../../database/tables/user-settings';

@Injectable({providedIn: 'root'})
export class UserSettingsService {

  db: DexieService = inject(DexieService);
  userExists = signal(false);

  async initialize(): Promise<void> {
    const exists = await this.checkUser();
    this.userExists.set(exists);
  }

  /** Returns the single user or undefined if not found */
  getUser() {
    return this.db.userSettings.toCollection().first();
  }

  async checkUser(): Promise<boolean> {
    return await this.getUser() != null;
  }

  /** Adds a user but throws if one already exists */
  async addUser(user: Omit<UserSettings, 'id'>) {
    const existingUser = await this.db.userSettings
      .toCollection()
      .first();
    if (existingUser) {
      throw new Error('A user already exists in the database.');
    }
    const id = this.db.userSettings.add(user);
    this.userExists.set(true);
    return id;
  }

  /** Updates the existing user; throws if none exists */
  async updateUser(changes: Partial<UserSettings>) {
    const existingUser = await this.db.userSettings
      .toCollection()
      .first();
    if (existingUser?.id === undefined) {
      throw new Error('No existing user to update.');
    }
    return this.db.userSettings.update(existingUser.id, changes);
  }
}
