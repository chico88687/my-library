import {inject, Injectable} from '@angular/core';
import {BookService} from '../../database/book.service';
import {WishListItemService} from '../../database/wish-list-item.service';
import {CategoryService} from '../../database/category.service';
import {AlertService} from '../../alert/alert.service';
import Papa from "papaparse";
import {Book} from '../../../database/tables/book';

@Injectable({providedIn: 'root'})
export class ImportService {

  private readonly bookService = inject(BookService);
  private readonly wishListService = inject(WishListItemService);
  private readonly categoryListService = inject(CategoryService);
  private readonly alertService = inject(AlertService);

  async importBooks(file: File): Promise<number> {
    console.log('Importing books from file:', file.name);
    // Validate file type
    if (!/\.(csv|txt)$/i.exec(file.name)) {
      this.alertService.addAlert('error', 'Invalid file', 'Only CSV or TXT files are allowed.');
      return 0;
    }

    // Parse CSV
    const fileContent = await file.text();
    const result = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (result.errors.length > 0) {
      this.alertService.addAlert(
        'error',
        'CSV parse error',
        result.errors.map(e => e.message).join(', ')
      );
      return 0;
    }

    const requiredHeaders = ['id', 'title', 'author', 'rating', 'notes', 'isFavorite', 'wasRead', 'categoryId', 'wishId'];
    const headersValid = requiredHeaders.every(h => result.meta.fields?.includes(h));
    if (!headersValid) {
      this.alertService.addAlert('error', 'Invalid CSV format', 'CSV headers do not match the expected format.');
      return 0;
    }

    const booksData: Book[] = result.data.map((row: any) => ({
      id: row.id ?? undefined,
      title: row.title,
      author: row.author,
      rating: row.rating ?? undefined,
      notes: row.notes ?? undefined,
      isFavorite: !!row.isFavorite,
      wasRead: !!row.wasRead,
      categoryId: row.categoryId ?? undefined,
      wishId: row.wishId ?? undefined,
    }));

    // Parallel check for categoryId and wishId existence
    await Promise.all(
      booksData.map(async (book) => {
        if (book.categoryId) {
          const category = await this.categoryListService.getById(book.categoryId);
          book.categoryId = category ? book.categoryId : undefined;
        }
        if (book.wishId) {
          const wish = await this.wishListService.getById(book.wishId);
          book.wishId = wish ? book.wishId : undefined;
        }
      })
    );

    // Get all existing books
    const existingBooks = await this.bookService.getAll();

    // Parallel add/update books
    await Promise.all(
      booksData.map(async (book) => {
        if (book.id) {
          const existing = existingBooks.find(b => b.id === book.id);
          if (existing) {
            await this.bookService.update(book.id, book, false);
          } else {
            const {id, ...bookData} = book;
            await this.bookService.add(bookData, false);
          }
        } else {
          const {id, ...bookData} = book;
          await this.bookService.add(bookData, false);
        }
      })
    );

    this.alertService.addAlert('success', 'Import completed', `${booksData.length} books imported successfully.`);
    return booksData.length;
  }

  async importWishListItems(file: File): Promise<number> {
    return 0;
  }

  async importCategories(file: File): Promise<number> {
    return 0;
  }
}
