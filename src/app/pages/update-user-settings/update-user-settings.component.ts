import {Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {ButtonModule} from 'primeng/button';
import {FloatLabelModule} from 'primeng/floatlabel';
import {UserSettingsService} from '../../service/database/user-settings.service';
import {UserSettingsFormGroup, UserSettingsFormService} from '../../service/form/user-settings.form.service';
import {UserSettings} from '../../database/tables/user-settings';
import {Router} from '@angular/router';

@Component({
  standalone: true,
  selector: 'update-user-settings',
  templateUrl: './update-user-settings.component.html',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule, ButtonModule, FloatLabelModule]
})
export class UpdateUserSettingsComponent implements OnInit {
  form!: UserSettingsFormGroup;
  isUpdate = false;

  private readonly userSettingsService = inject(UserSettingsService);
  private readonly formService = inject(UserSettingsFormService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.form = this.formService.createUserSettingsFormGroup();
    void this.detectModeAndLoad();
  }

  private async detectModeAndLoad(): Promise<void> {
    const existing: UserSettings | undefined = await this.userSettingsService.getUser();
    if (existing) {
      this.isUpdate = true;
      this.formService.resetForm(this.form, existing);
    } else {
      this.isUpdate = false;
      // form already initialized for creation (id: null)
    }
  }

  get canSave(): boolean {
    return this.form.valid;
  }

  async save(): Promise<void> {
    if (!this.form.valid) return;

    const value = this.formService.getUserSettings(this.form);

    try {
      if (this.isUpdate) {
        const { id, ...rest } = value as UserSettings; // id is number in the update flow
        await this.userSettingsService.updateUser({ ...rest });
      } else {
        const { id, ...rest } = value as any; // NewUserSettings has id: null
        await this.userSettingsService.addUser(rest);
        await this.router.navigate(['/my-books']);
      }
      // Optionally, refresh mode after save to reflect the persisted state
      await this.detectModeAndLoad();
    } catch (e) {
      // Minimal error handling
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}
