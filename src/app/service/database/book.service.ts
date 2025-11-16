import {inject, Injectable} from '@angular/core';
import {DexieService} from '../../database/dexie.service';
import {Book} from '../../database/tables/book';
import {AlertService} from '../alert/alert.service';
import {SortState} from '../../shared/sort-state/sort-state';

export interface BookFilter {
  searchTerm?: string;
  isFavorite?: boolean;
  wasRead?: boolean;
  categoryId?: number;
}

@Injectable({providedIn: 'root'})
export class BookService {

  private readonly db: DexieService = inject(DexieService);
  private readonly alertService = inject(AlertService);

  async getAll(sort?: SortState, filter?: BookFilter): Promise<Book[]> {
    let collection = this.db.books.toCollection();

    // --- Filtering ---
    if (filter) {
      collection = collection.filter(book => {
        let matches = true;

        if (filter.searchTerm) {
          const searchTerm = filter.searchTerm.toLowerCase().normalize("NFD").replaceAll(/\p{Diacritic}/gu, "");
          const title = book.title.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
          const author = book.author.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

          matches =
            matches &&
            (title.includes(searchTerm) || author.includes(searchTerm));
        }

        if (filter.isFavorite !== undefined) {
          matches = matches && book.isFavorite === filter.isFavorite;
        }

        if (filter.wasRead !== undefined) {
          matches = matches && book.wasRead === filter.wasRead;
        }

        if (filter.categoryId !== undefined) {
          matches = matches && book.categoryId === filter.categoryId;
        }

        return matches;
      });
    }

    // --- Sorting ---
    const result = await collection.toArray();

    if (sort?.predicate) {
      result.sort((a, b) => {
        const valA = String(a[sort.predicate as keyof Book] ?? "")
          .normalize("NFD")
          .replaceAll(/\p{Diacritic}/gu, "");
        const valB = String(b[sort.predicate as keyof Book] ?? "")
          .normalize("NFD")
          .replaceAll(/\p{Diacritic}/gu, "");

        // localeCompare is accent-insensitive with `sensitivity: "base"`
        const cmp = valA.localeCompare(valB, undefined, { sensitivity: "base" });
        return sort.order === "desc" ? -cmp : cmp;
      });
    }

    return result;
  }

  async getById(id: number): Promise<Book | undefined> {
    return this.db.books.get(id);
  }

  async countByCategoryId(categoryId: number): Promise<number> {
    return this.db.books
      .where('categoryId')
      .equals(categoryId)
      .count();
  }

  add(book: Omit<Book, 'id'>, shouldAddAlert = true) {
    const added = this.db.books.add(book);
    if (shouldAddAlert) {
      this.alertService.addAlert('success', 'Book Added', 'Book added successfully');
    }
    return added;
  }

  async update(id: number, changes: Partial<Book>, shouldAddAlert = true): Promise<number> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error('The book you are trying to update doesn\'t exist');
    }
    const updatedBook = await this.db.books.update(id, changes);
    const message = current.title + ' has been updated';
    if (shouldAddAlert) {
      this.alertService.addAlert('success', message, message);
    }
    return updatedBook;
  }

  async updateFavorite(id: number): Promise<number> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error('The book you are trying to update doesn\'t exist');
    }
    const newFavoriteStatus = !current.isFavorite;
    const updated = await this.db.books.update(id, {isFavorite: newFavoriteStatus});

    const message = `${current.title} is ${newFavoriteStatus ? 'now a favorite' : 'no longer a favorite'}`;
    this.alertService.addAlert('secondary', message);

    return updated;
  }

  async updateWasRead(id: number): Promise<number> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error('The book you are trying to update doesn\'t exist');
    }
    const newWasReadStatus = !current.wasRead;
    const updated = await this.db.books.update(id, {wasRead: newWasReadStatus});

    const message = `${current.title} is marked as ${newWasReadStatus ? 'read' : 'not read'}`;
    this.alertService.addAlert('secondary', message);

    return updated;
  }


  async updateRating(id: number, rating: number): Promise<number> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error('The book you are trying to update doesn\'t exist');
    }
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

  async deleteAll(): Promise<void> {
    await this.db.books.clear();
    this.alertService.addAlert('secondary', 'All books have been deleted');
  }
}
