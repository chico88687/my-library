import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Book } from '../../database/tables/book';
import { Category } from '../../database/tables/category';

// --- Type helpers ---
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };
export type NewBook = Omit<Book, 'id'> & { id: null };
export type BookFormGroupInput = Book | PartialWithRequiredKeyOf<NewBook>;

export type BookFormDefaults = Pick<NewBook, 'id' | 'isFavorite' | 'wasRead'> & {
  rating: number | null;
  notes: string;
  category: Category | null;
  wishId: number | null;
};

// --- Form content ---
export type BookFormGroupContent = {
  id: FormControl<Book['id'] | NewBook['id']>;
  title: FormControl<Book['title']>;
  author: FormControl<Book['author']>;
  rating: FormControl<Book['rating'] | null>;
  notes: FormControl<NonNullable<Book['notes']>>;
  isFavorite: FormControl<Book['isFavorite']>;
  wasRead: FormControl<Book['wasRead']>;
  category: FormControl<Category | null>;
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
      category: new FormControl(bookRawValue.category),
      wishId: new FormControl(bookRawValue.wishId),
    });
  }

  getBook(form: BookFormGroup): Book | NewBook {
    const raw = form.getRawValue();

    const rating = raw.rating === null ? undefined : raw.rating;
    const categoryId = raw.category ? raw.category.id : undefined;
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

  resetForm(form: BookFormGroup, book: BookFormGroupInput, category: Category | null): void {
    const bookRawValue = { ...this.getFormDefaults(), ...book };

    form.reset({
      id: { value: bookRawValue.id, disabled: true },
      title: bookRawValue.title ?? '',
      author: bookRawValue.author ?? '',
      rating: bookRawValue.rating,
      notes: bookRawValue.notes,
      isFavorite: bookRawValue.isFavorite,
      wasRead: bookRawValue.wasRead,
      category: category, // handle both category object or categoryId
      wishId: bookRawValue.wishId,
    } as any);
  }

  private getFormDefaults(): BookFormDefaults {
    return {
      id: null,
      title: '' as any,
      author: '' as any,
      rating: null,
      notes: '',
      isFavorite: false,
      wasRead: false,
      category: null,
      wishId: null,
    } as BookFormDefaults & { title: string; author: string };
  }
}
