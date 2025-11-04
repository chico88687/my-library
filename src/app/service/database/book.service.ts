import {inject, Injectable} from '@angular/core';
import {DexieService} from '../../database/dexie.service';
import {Book} from '../../database/tables/book';
import {AlertService} from '../alert/alert.service';
import {SortState} from '../../shared/sort-button/sort-state';

export interface BookFilter {
  searchTerm?: string;
  isFavorite?: boolean;
  wasRead?: boolean;
}

@Injectable({providedIn: 'root'})
export class BookService {

  private readonly db: DexieService = inject(DexieService);
  private readonly alertService = inject(AlertService);

  async getAll(sort?: SortState, filter?: BookFilter): Promise<Book[]> {
    let collection = this.db.books.toCollection();

    if (filter) {
      collection = collection.filter(book => {
        let matches = true;
        if (filter.searchTerm) {
          const searchTerm = filter.searchTerm.toLowerCase();
          matches =
            matches &&
            (book.title.toLowerCase().includes(searchTerm) ||
              book.author.toLowerCase().includes(searchTerm));
        }

        if (filter.isFavorite !== undefined) {
          matches = matches && book.isFavorite === filter.isFavorite;
        }

        if (filter.wasRead !== undefined) {
          matches = matches && book.wasRead === filter.wasRead;
        }

        return matches;
      });
    }

    // --- Apply sorting ---
    if (sort?.predicate) {
      const result = await collection.sortBy(sort.predicate as keyof Book);
      if (sort.order === 'desc') {
        return result.reverse();
      }
      return result;
    }

    // Default: return unsorted collection
    return collection.toArray();
  }

  async getById(id: number): Promise<Book | undefined> {
    return this.db.books.get(id);
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
}
