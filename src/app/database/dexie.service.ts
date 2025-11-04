import {Injectable} from '@angular/core';
import Dexie, {Table} from 'dexie';
import {Book} from './tables/book';
import {WishListItem} from './tables/wish-list-item';
import {UserSettings} from './tables/user-settings';
import {Category} from './tables/category';

@Injectable({providedIn: 'root'})
export class DexieService extends Dexie {

  books!: Table<Book, number>;
  wishListItems!: Table<WishListItem, number>;
  categories!: Table<Category, number>;
  userSettings!: Table<UserSettings, number>;

  constructor() {
    super('MyLibraryDB');
    this.version(1).stores({
      books: '++id, title, author, rating, notes, isFavorite, wasRead, categoryId, wishId',
      wishList: '++id, title, author, description, notes, categoryId,bookId',
      categories: '++id, name',
      userSettings: '++id, name, apiKey, limitCalls'
    });
  }
}
