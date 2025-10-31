import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Book } from '../../database/tables/book';

// JHipster-like typed form service for Book

/** Utility type that makes all fields optional except the required key `id`. */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/** NewBook type used by forms for create flow (id is always null). */
export type NewBook = Omit<Book, 'id'> & { id: null };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts Book for edit and NewBook for create.
 */
export type BookFormGroupInput = Book | PartialWithRequiredKeyOf<NewBook>;

/** Defaults applied when creating or resetting the form. */
export type BookFormDefaults = Pick<NewBook, 'id' | 'isFavorite' | 'wasRead'> & {
  rating: number | null;
  notes: string;
  categoryId: number | null;
  wishId: number | null;
};

export type BookFormGroupContent = {
  id: FormControl<Book['id'] | NewBook['id']>;
  title: FormControl<Book['title']>;
  author: FormControl<Book['author']>;
  rating: FormControl<Book['rating'] | null>;
  notes: FormControl<NonNullable<Book['notes']>>;
  isFavorite: FormControl<Book['isFavorite']>;
  wasRead: FormControl<Book['wasRead']>;
  categoryId: FormControl<Book['categoryId'] | null>;
  wishId: FormControl<Book['wishId'] | null>;
};

export type BookFormGroup = FormGroup<BookFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class BookFormService {
  createBookFormGroup(book: BookFormGroupInput = { id: null }): BookFormGroup {
    const bookRawValue = { ...this.getFormDefaults(), ...book };

    return new FormGroup<BookFormGroupContent>({
      id: new FormControl({ value: bookRawValue.id, disabled: true }),
      title: new FormControl(bookRawValue.title ?? '', { nonNullable: true, validators: [Validators.required] }),
      author: new FormControl(bookRawValue.author ?? '', { nonNullable: true, validators: [Validators.required] }),
      rating: new FormControl(bookRawValue.rating),
      notes: new FormControl(bookRawValue.notes, { nonNullable: true }),
      isFavorite: new FormControl(bookRawValue.isFavorite, { nonNullable: true }),
      wasRead: new FormControl(bookRawValue.wasRead, { nonNullable: true }),
      categoryId: new FormControl(bookRawValue.categoryId),
      wishId: new FormControl(bookRawValue.wishId),
    });
  }

  getBook(form: BookFormGroup): Book | NewBook {
    const raw = form.getRawValue();
    // Map nulls to undefined for optional fields where appropriate
    const rating = raw.rating === null ? undefined : raw.rating;
    const categoryId = raw.categoryId === null ? undefined : raw.categoryId;
    const wishId = raw.wishId === null ? undefined : raw.wishId;

    if (raw.id === null) {
      const created: NewBook = {
        id: null,
        title: raw.title,
        author: raw.author,
        rating,
        notes: raw.notes,
        isFavorite: raw.isFavorite,
        wasRead: raw.wasRead,
        categoryId,
        wishId,
      };
      return created;
    }

    const updated: Book = {
      id: raw.id as number,
      title: raw.title,
      author: raw.author,
      rating,
      notes: raw.notes,
      isFavorite: raw.isFavorite,
      wasRead: raw.wasRead,
      categoryId,
      wishId,
    };
    return updated;
  }

  resetForm(form: BookFormGroup, book: BookFormGroupInput): void {
    const bookRawValue = { ...this.getFormDefaults(), ...book };
    form.reset({
      id: { value: bookRawValue.id, disabled: true },
      title: bookRawValue.title ?? '',
      author: bookRawValue.author ?? '',
      rating: bookRawValue.rating,
      notes: bookRawValue.notes,
      isFavorite: bookRawValue.isFavorite,
      wasRead: bookRawValue.wasRead,
      categoryId: bookRawValue.categoryId,
      wishId: bookRawValue.wishId,
    } as any);
  }

  private getFormDefaults(): BookFormDefaults {
    return {
      id: null,
      title: '' as any, // will be overridden if provided
      author: '' as any, // will be overridden if provided
      rating: null,
      notes: '',
      isFavorite: false,
      wasRead: false,
      categoryId: null,
      wishId: null,
    } as BookFormDefaults & { title: string; author: string };
  }
}
