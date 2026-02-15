import {inject, Injectable} from '@angular/core';
import {BookService} from '../../database/book.service';
import {WishListItemService} from '../../database/wish-list-item.service';
import {CategoryService} from '../../database/category.service';
import {AlertService} from '../../alert/alert.service';
import Papa from "papaparse";
import {Book} from '../../../database/tables/book';
import {WishListItem} from '../../../database/tables/wish-list-item';
import {Category} from '../../../database/tables/category';

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

    const requiredHeaders = [
      'id', 'title', 'author', 'rating', 'notes', 'isFavorite', 'wasRead', 'categoryId', 'wishId',
      'addedDate', 'bookCover'
    ];
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
      bookCover: row.bookCover ?? undefined,
      addedDate: row.addedDate ? new Date(row.addedDate) : new Date('2024-01-01'),
    }));

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
            await this.bookService.putWithId(book, false);
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
    // Validate file type
    if (!/\.(csv|txt)$/i.exec(file.name)) {
      this.alertService.addAlert('error', 'Invalid file', 'Only CSV or TXT files are allowed.');
      return 0;
    }

    const fileContent = await file.text();
    const result = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (result.errors.length > 0) {
      this.alertService.addAlert('error', 'CSV parse error', result.errors.map(e => e.message).join(', '));
      return 0;
    }

    const requiredHeaders = ['id','title','author','description','why','notes','added','categoryId','bookId'];
    const headersValid = requiredHeaders.every(h => result.meta.fields?.includes(h));
    if (!headersValid) {
      this.alertService.addAlert('error', 'Invalid CSV format', 'CSV headers do not match the expected format.');
      return 0;
    }

    const items: WishListItem[] = result.data.map((row: any) => ({
      id: row.id ?? undefined,
      title: row.title,
      author: row.author,
      description: row.description ?? undefined,
      why: row.why ?? undefined,
      notes: row.notes ?? undefined,
      added: !!row.added,
      categoryId: row.categoryId ?? undefined,
      bookId: row.bookId ?? undefined,
    }));

    const existing = await this.wishListService.getAll();

    await Promise.all(items.map(async (w) => {
      if (w.id) {
        const ex = existing.find(e => e.id === w.id);
        if (ex) {
          await this.wishListService.update(w.id!, w);
        } else {
          // Preserve provided id by using put (upsert) so Dexie doesn't generate a new one
          await this.wishListService.putWithId(w);
        }
      } else {
        const {id, ...data} = w as WishListItem;
        await this.wishListService.add(data);
      }
    }));

    this.alertService.addAlert('success', 'Import completed', `${items.length} wish list items imported successfully.`);
    return items.length;
  }

  async importCategories(file: File): Promise<number> {
    // Validate file type
    if (!/\.(csv|txt)$/i.exec(file.name)) {
      this.alertService.addAlert('error', 'Invalid file', 'Only CSV or TXT files are allowed.');
      return 0;
    }

    const fileContent = await file.text();
    const result = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (result.errors.length > 0) {
      this.alertService.addAlert('error', 'CSV parse error', result.errors.map(e => e.message).join(', '));
      return 0;
    }

    const requiredHeaders = ['id','name'];
    const headersValid = requiredHeaders.every(h => result.meta.fields?.includes(h));
    if (!headersValid) {
      this.alertService.addAlert('error', 'Invalid CSV format', 'CSV headers do not match the expected format.');
      return 0;
    }

    const categories: Category[] = result.data.map((row: any) => ({
      id: row.id ?? undefined,
      name: row.name,
    }));

    const existing = await this.categoryListService.getAll();

    await Promise.all(categories.map(async (c) => {
      if (c.id) {
        const ex = existing.find(e => e.id === c.id);
        if (ex) {
          await this.categoryListService.update(c.id!, c);
        } else {
          // Preserve provided id by using put (upsert) so Dexie doesn't generate a new one
          await this.categoryListService.putWithId(c);
        }
      } else {
        const {id, ...data} = c as Category;
        await this.categoryListService.add(data);
      }
    }));

    this.alertService.addAlert('success', 'Import completed', `${categories.length} categories imported successfully.`);
    return categories.length;
  }
}
