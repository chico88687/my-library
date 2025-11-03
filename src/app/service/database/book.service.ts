import {inject, Injectable} from '@angular/core';
import {DexieService} from '../../database/dexie.service';
import {Book} from '../../database/tables/book';
import {AlertService} from '../alert/alert.service';

@Injectable({providedIn: 'root'})
export class BookService {

  private readonly db: DexieService = inject(DexieService);
  private readonly alertService = inject(AlertService);

  getAll() {
    return this.db.books.toArray();
  }

  getById(id: number) {
    return this.db.books.get(id);
  }

  add(book: Omit<Book, 'id'>) {
    const added = this.db.books.add(book);
    this.alertService.addAlert('success', 'Book Added', 'Book added successfully');
    return added;
  }

  update(id: number, changes: Partial<Book>) {
    return this.db.books.update(id, changes);
  }

  async changeFavorite(id: number) {
    const current = await this.db.books.get(id);
    if (!current) {
      throw new Error('Book not found');
    }
    const updated = await this.db.books.update(id, {isFavorite: !current.isFavorite});
    const message = current.title + ' is now ' + (current.isFavorite ? 'not' : '') + ' a favorite';
    this.alertService.addAlert('secondary', message);
    return updated;
  }

  delete(id: number) {
    return this.db.books.delete(id);
  }
}
