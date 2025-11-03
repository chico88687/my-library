import {inject, Injectable} from '@angular/core';
import {DexieService} from '../../database/dexie.service';
import {Book} from '../../database/tables/book';
import {AlertService} from '../alert/alert.service';

@Injectable({providedIn: 'root'})
export class BookService {

  private readonly db: DexieService = inject(DexieService);
  private readonly alertService = inject(AlertService);

  async getAll(): Promise<Book[]> {
    return this.db.books.toArray();
  }

  async getById(id: number): Promise<Book> {
    const book = await this.db.books.get(id);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  add(book: Omit<Book, 'id'>) {
    const added = this.db.books.add(book);
    this.alertService.addAlert('success', 'Book Added', 'Book added successfully');
    return added;
  }

  async update(id: number, changes: Partial<Book>): Promise<number> {
    const current = await this.getById(id);
    const updatedBook = await this.db.books.update(id, changes);
    const message = current.title + ' has been updated';
    this.alertService.addAlert('success', message, message);
    return updatedBook;
  }

  async updateFavorite(id: number): Promise<number> {
    const current = await this.getById(id);
    const newFavoriteStatus = !current.isFavorite;
    const updated = await this.db.books.update(id, {isFavorite: newFavoriteStatus});

    const message = `${current.title} is ${newFavoriteStatus ? 'now a favorite' : 'no longer a favorite'}`;
    this.alertService.addAlert('secondary', message);

    return updated;
  }

  async updateRating(id: number, rating: number): Promise<number> {
    const current = await this.getById(id);
    const updated = await this.db.books.update(id, {rating});

    const message = `${current.title} has been rated ${rating} stars`;
    this.alertService.addAlert('secondary', message);

    return updated;
  }

  async delete(book: Book): Promise<void> {
    await this.db.books.delete(book.id!);
    const message = book.title + ' has been deleted';
    this.alertService.addAlert('secondary', 'Book', message);
  }
}
