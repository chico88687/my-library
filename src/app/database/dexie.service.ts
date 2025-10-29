import {Injectable} from '@angular/core';
import Dexie, {Table} from 'dexie';
import {Book} from './tables/book';
import {WishListItem} from './tables/wish-list-item';

@Injectable({ providedIn: 'root' })
export class DexieService extends Dexie {
  books!: Table<Book, number>;
  wishListItems!: Table<WishListItem, number>;

  constructor() {
    super('MyLibraryDB');
    this.version(1).stores({
      books: '++id, title, author, rating, wishId',
      wishList: '++id, title, author, matchScore, bookId'
    });
  }
}
