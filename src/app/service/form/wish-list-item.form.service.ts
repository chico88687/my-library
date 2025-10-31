import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WishListItem } from '../../database/tables/wish-list-item';

/** Utility type that makes all fields optional except the required key `id`. */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/** NewWishListItem type used by forms for create flow (id is always null). */
export type NewWishListItem = Omit<WishListItem, 'id'> & { id: null };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts WishListItem for edit and NewWishListItem for create.
 */
export type WishListItemFormGroupInput = WishListItem | PartialWithRequiredKeyOf<NewWishListItem>;

/** Defaults applied when creating or resetting the form. */
export type WishListItemFormDefaults = Pick<NewWishListItem, 'id'> & {
  notes: string;
  categoryId: number | null;
  bookId: number | null;
};

export type WishListItemFormGroupContent = {
  id: FormControl<WishListItem['id'] | NewWishListItem['id']>;
  title: FormControl<WishListItem['title']>;
  author: FormControl<WishListItem['author']>;
  description: FormControl<WishListItem['description']>;
  notes: FormControl<NonNullable<WishListItem['notes']>>;
  categoryId: FormControl<WishListItem['categoryId'] | null>;
  bookId: FormControl<WishListItem['bookId'] | null>;
};

export type WishListItemFormGroup = FormGroup<WishListItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class WishListItemFormService {
  createWishListItemFormGroup(item: WishListItemFormGroupInput = { id: null }): WishListItemFormGroup {
    const rawValue = { ...this.getFormDefaults(), ...item };

    return new FormGroup<WishListItemFormGroupContent>({
      id: new FormControl({ value: rawValue.id, disabled: true }),
      title: new FormControl(rawValue.title ?? '', { nonNullable: true, validators: [Validators.required] }),
      author: new FormControl(rawValue.author ?? '', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl(rawValue.description ?? '', { nonNullable: true, validators: [Validators.required] }),
      notes: new FormControl(rawValue.notes, { nonNullable: true }),
      categoryId: new FormControl(rawValue.categoryId),
      bookId: new FormControl(rawValue.bookId),
    });
  }

  getWishListItem(form: WishListItemFormGroup): WishListItem | NewWishListItem {
    const raw = form.getRawValue();

    const categoryId = raw.categoryId === null ? undefined : raw.categoryId;
    const bookId = raw.bookId === null ? undefined : raw.bookId;
    const notes = raw.notes === '' ? undefined : raw.notes;

    if (raw.id === null) {
      const created: NewWishListItem = {
        id: null,
        title: raw.title,
        author: raw.author,
        description: raw.description,
        notes,
        categoryId,
        bookId,
      };
      return created;
    }

    const updated: WishListItem = {
      id: raw.id as number,
      title: raw.title,
      author: raw.author,
      description: raw.description,
      notes,
      categoryId,
      bookId,
    };
    return updated;
  }

  resetForm(form: WishListItemFormGroup, item: WishListItemFormGroupInput): void {
    const rawValue = { ...this.getFormDefaults(), ...item };
    form.reset({
      id: { value: rawValue.id, disabled: true },
      title: rawValue.title ?? '',
      author: rawValue.author ?? '',
      description: rawValue.description ?? '',
      notes: rawValue.notes,
      categoryId: rawValue.categoryId,
      bookId: rawValue.bookId,
    } as any);
  }

  private getFormDefaults(): WishListItemFormDefaults {
    return {
      id: null,
      notes: '',
      categoryId: null,
      bookId: null,
    };
  }
}
