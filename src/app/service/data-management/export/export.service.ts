import { inject, Injectable } from '@angular/core';
import Papa from 'papaparse';
import {BookService} from '../../database/book.service';
import {AlertService} from '../../alert/alert.service';
import {Book} from '../../../database/tables/book';

@Injectable({ providedIn: 'root' })
export class ExportService {

  private readonly bookService = inject(BookService);
  private readonly alertService = inject(AlertService);

  /**
   * Exports all books into a downloadable CSV file.
   */
  async exportBooks(): Promise<void> {
    try {
      const books: Book[] = await this.bookService.getAll();

      if (!books || books.length === 0) {
        this.alertService.addAlert(
          'warning',
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
      this.triggerDownload(csv, 'books_export.csv');

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

  }

  async exportCategories(): Promise<void> {

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
}
