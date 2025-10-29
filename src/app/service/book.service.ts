import { Injectable } from '@angular/core';
import {DexieService} from '../database/dexie.service';
import {Book} from '../database/tables/book';

@Injectable({ providedIn: 'root' })
export class BookService {
  constructor(private readonly db: DexieService) {}

  getAll() {
    return this.db.books.toArray();
  }

  getById(id: number) {
    return this.db.books.get(id);
  }

  add(book: Omit<Book, 'id'>) {
    return this.db.books.add(book);
  }

  update(id: number, changes: Partial<Book>) {
    return this.db.books.update(id, changes);
  }

  delete(id: number) {
    return this.db.books.delete(id);
  }
}
