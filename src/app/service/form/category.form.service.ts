import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Category } from '../../database/tables/category';

/** Utility type that makes all fields optional except the required key `id`. */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/** NewCategory type used by forms for create flow (id is always null). */
export type NewCategory = Omit<Category, 'id'> & { id: null };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts Category for edit and NewCategory for create.
 */
export type CategoryFormGroupInput = Category | PartialWithRequiredKeyOf<NewCategory>;

/** Defaults applied when creating or resetting the form. */
export type CategoryFormDefaults = Pick<NewCategory, 'id'>;

export type CategoryFormGroupContent = {
  id: FormControl<Category['id'] | NewCategory['id']>;
  name: FormControl<Category['name']>;
};

export type CategoryFormGroup = FormGroup<CategoryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class CategoryFormService {
  createCategoryFormGroup(category: CategoryFormGroupInput = { id: null }): CategoryFormGroup {
    const categoryRawValue = { ...this.getFormDefaults(), ...category };

    return new FormGroup<CategoryFormGroupContent>({
      id: new FormControl({ value: categoryRawValue.id, disabled: true }),
      name: new FormControl(categoryRawValue.name ?? '', { nonNullable: true, validators: [Validators.required] }),
    });
  }

  getCategory(form: CategoryFormGroup): Category | NewCategory {
    const raw = form.getRawValue();

    if (raw.id === null) {
      const created: NewCategory = {
        id: null,
        name: raw.name,
      };
      return created;
    }

    const updated: Category = {
      id: raw.id as number,
      name: raw.name,
    };
    return updated;
  }

  resetForm(form: CategoryFormGroup, category: CategoryFormGroupInput): void {
    const categoryRawValue = { ...this.getFormDefaults(), ...category };
    form.reset({
      id: { value: categoryRawValue.id, disabled: true },
      name: categoryRawValue.name ?? '',
    } as any);
  }

  private getFormDefaults(): CategoryFormDefaults {
    return {
      id: null,
    };
  }
}
