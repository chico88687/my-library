import {inject, Injectable} from '@angular/core';
import {DexieService} from '../../database/dexie.service';
import {WishListItem} from '../../database/tables/wish-list-item';
import {SortState} from '../../shared/sort-state/sort-state';
import {AlertService} from '../alert/alert.service';

export interface WishListFilter {
  searchTerm?: string;
  categoryId?: number;
  // 3-state filter: undefined -> all, true -> only added, false -> only not added
  added?: boolean;
}

@Injectable({ providedIn: 'root' })
export class WishListItemService {
  private readonly db: DexieService = inject(DexieService);
  private readonly alertService: AlertService = inject(AlertService);

  async getAll(sort?: SortState, filter?: WishListFilter): Promise<WishListItem[]> {
    let collection = this.db.wishListItems.toCollection();

    if (filter) {
      collection = collection.filter(item => {
        let matches = true;

        if (filter.searchTerm) {
          const searchTerm = filter.searchTerm.toLowerCase().normalize('NFD').replaceAll(/\p{Diacritic}/gu, '');
          const title = (item.title ?? '').toLowerCase().normalize('NFD').replaceAll(/\p{Diacritic}/gu, '');
          const author = (item.author ?? '').toLowerCase().normalize('NFD').replaceAll(/\p{Diacritic}/gu, '');
          matches = matches && (title.includes(searchTerm) || author.includes(searchTerm));
        }

        if (filter.categoryId !== undefined) {
          matches = matches && item.categoryId === filter.categoryId;
        }

        if (filter.added !== undefined) {
          matches = matches && item.added === filter.added;
        }

        return matches;
      });
    }

    const result = await collection.toArray();

    if (sort?.predicate) {
      result.sort((a, b) => {
        const valA = String(a[sort.predicate as keyof WishListItem] ?? '')
          .normalize('NFD')
          .replaceAll(/\p{Diacritic}/gu, '');
        const valB = String(b[sort.predicate as keyof WishListItem] ?? '')
          .normalize('NFD')
          .replaceAll(/\p{Diacritic}/gu, '');
        const cmp = valA.localeCompare(valB, undefined, {sensitivity: 'base'});
        return sort.order === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }

  async getById(id: number) {
    return this.db.wishListItems.get(id);
  }

  add(wishListItem: Omit<WishListItem, 'id'>) {
    const added = this.db.wishListItems.add(wishListItem);
    this.alertService.addAlert('success', 'Wish list item saved successfully');
    return added;
  }

  async update(id: number, changes: Partial<WishListItem>) {
    const current = await this.getById(id);
    if (!current) {
      throw new Error('The item you are trying to update doesn\'t exist');
    }
    const updated = await this.db.wishListItems.update(id, changes);
    const message = `${current.title} has been updated`;
    this.alertService.addAlert('success', message, message);
    return updated;
  }

  async deleteByEntity(item: WishListItem): Promise<void> {
    await this.db.wishListItems.delete(item.id!);
    const message = `${item.title} has been deleted`;
    this.alertService.addAlert('secondary', 'Wish List', message);
  }
}
