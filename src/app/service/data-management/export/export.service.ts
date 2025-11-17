import { inject, Injectable } from '@angular/core';
import Papa from 'papaparse';
import {BookService} from '../../database/book.service';
import {AlertService} from '../../alert/alert.service';
import {Book} from '../../../database/tables/book';
import {WishListItemService} from '../../database/wish-list-item.service';
import {WishListItem} from '../../../database/tables/wish-list-item';
import {CategoryService} from '../../database/category.service';
import {Category} from '../../../database/tables/category';
import {UserSettingsService} from '../../database/user-settings.service';

@Injectable({ providedIn: 'root' })
export class ExportService {

  private readonly bookService = inject(BookService);
  private readonly wishService = inject(WishListItemService);
  private readonly categoryService = inject(CategoryService);
  private readonly userSettingsService = inject(UserSettingsService);
  private readonly alertService = inject(AlertService);

  /**
   * Exports all books into a downloadable CSV file.
   */
  async exportBooks(): Promise<void> {
    try {
      const books: Book[] = await this.bookService.getAll();

      if (!books || books.length === 0) {
        this.alertService.addAlert(
          'secondary',
          'No Data',
          'There are no books to export.'
        );
        return;
      }

      // Prepare CSV-compatible rows (ensures missing fields are included)
      const rows = books.map(book => ({
        id: book.id ?? '',
        title: book.title ?? '',
        author: book.author ?? '',
        rating: book.rating ?? '',
        notes: book.notes ?? '',
        isFavorite: book.isFavorite,
        wasRead: book.wasRead,
        categoryId: book.categoryId ?? '',
        wishId: book.wishId ?? '',
      }));

      // Convert to CSV using Papa
      const csv = Papa.unparse(rows, { header: true });

      // Trigger file download
      const filename = await this.buildExportFileName('Books');
      this.triggerDownload(csv, filename);

      this.alertService.addAlert(
        'success',
        'Export completed',
        `${books.length} books exported successfully.`
      );
    } catch (e) {
      console.error(e);
      this.alertService.addAlert(
        'error',
        'Export failed',
        'An unexpected error occurred while exporting books.'
      );
    }
  }

  async exportWishListItems(): Promise<void> {
    try {
      const wishes: WishListItem[] = await this.wishService.getAll();
      if (!wishes || wishes.length === 0) {
        this.alertService.addAlert('secondary', 'No Data', 'There are no wish list items to export.');
        return;
      }
      const rows = wishes.map(w => ({
        id: w.id ?? '',
        title: w.title ?? '',
        author: w.author ?? '',
        description: w.description ?? '',
        why: w.why ?? '',
        notes: w.notes ?? '',
        added: w.added,
        categoryId: w.categoryId ?? '',
        bookId: w.bookId ?? '',
      }));
      const csv = Papa.unparse(rows, { header: true });
      const filename = await this.buildExportFileName('Wish List');
      this.triggerDownload(csv, filename);
      this.alertService.addAlert('success', 'Export completed', `${wishes.length} wish list items exported successfully.`);
    } catch (e) {
      console.error(e);
      this.alertService.addAlert('error', 'Export failed', 'An unexpected error occurred while exporting wish list items.');
    }
  }

  async exportCategories(): Promise<void> {
    try {
      const categories: Category[] = await this.categoryService.getAll();
      if (!categories || categories.length === 0) {
        this.alertService.addAlert('secondary', 'No Data', 'There are no categories to export.');
        return;
      }
      const rows = categories.map(c => ({
        id: c.id ?? '',
        name: c.name ?? '',
      }));
      const csv = Papa.unparse(rows, { header: true });
      const filename = await this.buildExportFileName('Categories');
      this.triggerDownload(csv, filename);
      this.alertService.addAlert('success', 'Export completed', `${categories.length} categories exported successfully.`);
    } catch (e) {
      console.error(e);
      this.alertService.addAlert('error', 'Export failed', 'An unexpected error occurred while exporting categories.');
    }
  }

  /**
   * Creates a download action for a text file (CSV).
   */
  private triggerDownload(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // Needed for Android / Capacitor WebView compatibility
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  private async buildExportFileName(entity: string): Promise<string> {
    const user = await this.userSettingsService.getUser();
    const userName = user?.name ?? 'user';
    const safe = (s: string) => String(s).trim().replace(/\s+/g, '-');
    const stamp = this.formatTimestamp(new Date());
    return `${safe(userName)}_${safe(entity)}_${stamp}.csv`;
  }

  private formatTimestamp(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const HH = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}${MM}${dd}_${HH}${mm}${ss}`;
  }
}
