import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {WishListItem} from '../../database/tables/wish-list-item';
import {Category} from '../../database/tables/category';

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
export type WishListItemFormDefaults = Pick<NewWishListItem, 'id' | 'added'> & {
  notes: string;
  category: Category | null;
  bookId: number | null;
  why: string;
};

export type WishListItemFormGroupContent = {
  id: FormControl<WishListItem['id'] | NewWishListItem['id']>;
  title: FormControl<WishListItem['title']>;
  author: FormControl<WishListItem['author']>;
  description: FormControl<WishListItem['description']>;
  why: FormControl<NonNullable<WishListItem['why']>>;
  notes: FormControl<NonNullable<WishListItem['notes']>>;
  added: FormControl<WishListItem['added']>;
  category: FormControl<Category | null>;
  bookId: FormControl<WishListItem['bookId'] | null>;
};

export type WishListItemFormGroup = FormGroup<WishListItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class WishListItemFormService {
  createWishListItemFormGroup(item: WishListItemFormGroupInput = { id: null }): WishListItemFormGroup {
    const rawValue = { ...this.getFormDefaults(), ...item } as any;

    return new FormGroup<WishListItemFormGroupContent>({
      id: new FormControl({ value: rawValue.id, disabled: true }),
      title: new FormControl(rawValue.title ?? '', { nonNullable: true, validators: [Validators.required] }),
      author: new FormControl(rawValue.author ?? '', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl(rawValue.description ?? ''),
      why: new FormControl(rawValue.why ?? ''),
      notes: new FormControl(rawValue.notes, { nonNullable: true }),
      added: new FormControl(rawValue.added, { nonNullable: true }),
      category: new FormControl(rawValue.category),
      bookId: new FormControl(rawValue.bookId),
    });
  }

  getWishListItem(form: WishListItemFormGroup): WishListItem | NewWishListItem {
    const raw = form.getRawValue();

    const categoryId = raw.category ? raw.category.id : undefined;
    const bookId = raw.bookId === null ? undefined : raw.bookId;
    const notes = raw.notes === '' ? undefined : raw.notes;
    const why = raw.why === '' ? undefined : raw.why;
    const description = raw.description === '' ? undefined : raw.description;

    if (raw.id === null) {
      return {
        id: null,
        title: raw.title,
        author: raw.author,
        description,
        why,
        notes,
        added: raw.added,
        categoryId,
        bookId,
      };
    }

    return {
      id: raw.id as number,
      title: raw.title,
      author: raw.author,
      description,
      why,
      notes,
      added: raw.added,
      categoryId,
      bookId,
    };
  }

  resetForm(form: WishListItemFormGroup, item: WishListItemFormGroupInput, category: Category | null = null): void {
    const rawValue = { ...this.getFormDefaults(), ...item } as any;
    form.reset({
      id: { value: rawValue.id, disabled: true },
      title: rawValue.title ?? '',
      author: rawValue.author ?? '',
      description: rawValue.description ?? '',
      why: rawValue.why ?? '',
      notes: rawValue.notes,
      added: rawValue.added,
      category: category,
      bookId: rawValue.bookId,
    } as any);
  }

  private getFormDefaults(): WishListItemFormDefaults {
    return {
      id: null,
      notes: '',
      added: false,
      category: null,
      bookId: null,
      why: '',
    };
  }
}
