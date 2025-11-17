import {inject, Injectable, signal} from '@angular/core';
import {DexieService} from '../../database/dexie.service';
import {UserSettings} from '../../database/tables/user-settings';
import {AlertService} from '../alert/alert.service';
import {CryptoService} from '../crypto/crypto.service';

@Injectable({providedIn: 'root'})
export class UserSettingsService {

  db: DexieService = inject(DexieService);
  userExists = signal(false);
  private readonly alertService: AlertService = inject(AlertService);
  private readonly crypto = inject(CryptoService);

  async initialize(): Promise<void> {
    const exists = await this.checkUser();
    this.userExists.set(exists);
  }

  /** Returns the single user or undefined if not found */
  async getUser():Promise<UserSettings | undefined> {
    const stored = await this.db.userSettings.toCollection().first();
    if (!stored) return undefined;

    // Decrypt apiKey if present; tolerate legacy plaintext
    if (stored.apiKey) {
      try {
        const plaintext = await this.crypto.decrypt(stored.apiKey);
        return { ...stored, apiKey: plaintext };
      } catch {
        // assume it is plaintext legacy value
        return stored;
      }
    }
    return stored;
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
    const toStore: Omit<UserSettings, 'id'> = { ...user };
    if (toStore.apiKey) {
      toStore.apiKey = await this.crypto.encrypt(toStore.apiKey);
    }
    const id = this.db.userSettings.add(toStore);
    this.userExists.set(true);
    this.alertService.addAlert('success', 'User settings created successfully');
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

    const toStore: Partial<UserSettings> = { ...changes };
    if (toStore.apiKey) {
      toStore.apiKey = await this.crypto.encrypt(toStore.apiKey);
    }

    const result = this.db.userSettings.update(existingUser.id, toStore);
    this.alertService.addAlert('success', 'User settings updated successfully');
    return result;
  }

  async deleteAll(): Promise<void> {
    await this.db.userSettings.clear();
    this.userExists.set(false);
    this.alertService.addAlert('secondary', 'App user was deleted');
  }
}
