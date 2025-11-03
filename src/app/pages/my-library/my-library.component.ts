import {Component, inject, OnInit} from '@angular/core';
import {BookService} from '../../service/database/book.service';
import {Book} from '../../database/tables/book';
import {TableModule} from 'primeng/table';
import {BookListComponent} from '../../shared/book-list/book-list.component';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {SortMenuComponent} from '../../shared/sort-button/sort-menu.component';

@Component({
  standalone: true,
  selector: 'my-library',
  templateUrl: './my-library.component.html',
  imports: [TableModule, BookListComponent, Button, RouterLink, ConfirmDialog, SortMenuComponent],
  providers: [ConfirmationService]
})
export class MyLibraryComponent implements OnInit {

  books: Book[] = [];

  fieldAndLabelSortMap: Map<string, string> = new Map()
  sortState: { predicate?: string, order?: 'asc' | 'desc' } = {predicate: 'title', order: 'asc'};

  protected readonly bookService = inject(BookService);
  protected readonly confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.buildSortMap()
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAll().then(books => this.books = books);
  }

  protected changeFavorite($event: number) {
    this.bookService.updateFavorite($event).then(() => this.loadBooks());
  }

  protected updateRating($event: { book: Book; rating: number }): void {
    const bookId = $event.book.id!;
    const rating = $event.rating;
    this.bookService.updateRating(bookId, rating).then(() => this.loadBooks());
  }

  protected deleteBook($bookEvent: { book: Book, event: Event }): void {
    const book = $bookEvent.book;
    const event = $bookEvent.event;
    const message = `Are you sure you want to delete the book "${book.title}"?`;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message,
      // header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        void this.bookService.delete(book);
        this.loadBooks();
      },
    });
  }

  private buildSortMap(): void {
    this.fieldAndLabelSortMap = new Map<string, string>([
      ['title', 'Title'],
      ['author', 'Author'],
      ['rating', 'Rating'],
      ['isFavorite', 'Favorite'],
      ['wasRead', 'Already Read'],
    ]);
  }
}
