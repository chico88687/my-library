import {Injectable} from '@angular/core';
import {DexieService} from '../database/dexie.service';
import {WishListItem} from '../database/tables/wish-list-item';

@Injectable({ providedIn: 'root' })
export class WishListItemService {
  constructor(private readonly db: DexieService) {}

  getAll() {
    return this.db.wishListItems.toArray();
  }

  getById(id: number) {
    return this.db.wishListItems.get(id);
  }

  add(wishListItem: Omit<WishListItem, 'id'>) {
    return this.db.wishListItems.add(wishListItem);
  }

  update(id: number, changes: Partial<WishListItem>) {
    return this.db.wishListItems.update(id, changes);
  }

  delete(id: number) {
    return this.db.wishListItems.delete(id);
  }
}
