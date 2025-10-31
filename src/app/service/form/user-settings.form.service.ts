import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserSettings } from '../../database/tables/user-settings';

/** Utility type that makes all fields optional except the required key `id`. */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/** NewUserSettings type used by forms for create flow (id is always null). */
export type NewUserSettings = Omit<UserSettings, 'id'> & { id: null };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts UserSettings for edit and NewUserSettings for create.
 */
export type UserSettingsFormGroupInput = UserSettings | PartialWithRequiredKeyOf<NewUserSettings>;

/** Defaults applied when creating or resetting the form. */
export type UserSettingsFormDefaults = Pick<NewUserSettings, 'id'> & {
  apiKey: string | null;
  limitCalls: number | null;
};

export type UserSettingsFormGroupContent = {
  id: FormControl<UserSettings['id'] | NewUserSettings['id']>;
  name: FormControl<UserSettings['name']>;
  apiKey: FormControl<UserSettings['apiKey'] | string | null>;
  limitCalls: FormControl<UserSettings['limitCalls'] | null>;
};

export type UserSettingsFormGroup = FormGroup<UserSettingsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserSettingsFormService {
  createUserSettingsFormGroup(settings: UserSettingsFormGroupInput = { id: null }): UserSettingsFormGroup {
    const rawValue = { ...this.getFormDefaults(), ...settings };

    return new FormGroup<UserSettingsFormGroupContent>({
      id: new FormControl({ value: rawValue.id, disabled: true }),
      name: new FormControl(rawValue.name ?? '', { nonNullable: true, validators: [Validators.required] }),
      apiKey: new FormControl(rawValue.apiKey),
      limitCalls: new FormControl(rawValue.limitCalls),
    });
  }

  getUserSettings(form: UserSettingsFormGroup): UserSettings | NewUserSettings {
    const raw = form.getRawValue();

    const limitCalls = raw.limitCalls === null ? undefined : raw.limitCalls;
    const apiKey = raw.apiKey == null || raw.apiKey === '' ? undefined : raw.apiKey;

    if (raw.id === null) {
      const created: NewUserSettings = {
        id: null,
        name: raw.name,
        apiKey,
        limitCalls,
      };
      return created;
    }

    const updated: UserSettings = {
      id: raw.id as number,
      name: raw.name,
      apiKey,
      limitCalls,
    };
    return updated;
  }

  resetForm(form: UserSettingsFormGroup, settings: UserSettingsFormGroupInput): void {
    const rawValue = { ...this.getFormDefaults(), ...settings };
    form.reset({
      id: { value: rawValue.id, disabled: true },
      name: rawValue.name ?? '',
      apiKey: rawValue.apiKey,
      limitCalls: rawValue.limitCalls,
    } as any);
  }

  private getFormDefaults(): UserSettingsFormDefaults {
    return {
      id: null,
      apiKey: null,
      limitCalls: null,
    };
  }
}
