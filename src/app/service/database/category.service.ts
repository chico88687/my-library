import {Injectable, inject} from '@angular/core';
import {DexieService} from '../../database/dexie.service';
import {AlertService} from '../alert/alert.service';
import {Category} from '../../database/tables/category';

@Injectable({providedIn: 'root'})
export class CategoryService {

  private readonly db: DexieService = inject(DexieService);
  private readonly alertService = inject(AlertService);

  async getAll(): Promise<Category[]> {
    return this.db.categories.toArray();
  }

  async getById(id: number): Promise<Category | undefined> {
    return this.db.categories.get(id);
  }

  async add(category: Omit<Category, 'id'>) {
    const added = await this.db.categories.add(category);
    this.alertService.addAlert('success', 'Category added successfully');
    return added;
  }

  async update(id: number, changes: Partial<Category>): Promise<number> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error('The category you are trying to update was not found');
    }
    const updated = await this.db.categories.update(id, changes);
    const message = `${current.name} has been updated`;
    this.alertService.addAlert('success', message);
    return updated;
  }

  async delete(category: Category): Promise<void> {
    await this.db.categories.delete(category.id!);
    const message = `${category.name} has been deleted`;
    this.alertService.addAlert('secondary', message);
  }
}
