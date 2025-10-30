import {Injectable} from '@angular/core';
import Dexie, {Table} from 'dexie';
import {Book} from './tables/book';
import {WishListItem} from './tables/wish-list-item';
import {UserSettings} from './tables/user-settings';

@Injectable({ providedIn: 'root' })
export class DexieService extends Dexie {

  books!: Table<Book, number>;
  wishListItems!: Table<WishListItem, number>;
  userSettings!: Table<UserSettings, number>;

  constructor() {
    super('MyLibraryDB');
    this.version(1).stores({
      books: '++id, title, author, rating, wishId',
      wishList: '++id, title, author, matchScore, bookId',
      userSettings: '++id, name, apiKey, limitCalls'
    });
  }
}
