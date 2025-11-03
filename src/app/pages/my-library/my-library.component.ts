import {Component, inject, OnInit} from '@angular/core';
import {BookService} from '../../service/database/book.service';
import {Book} from '../../database/tables/book';
import {TableModule} from 'primeng/table';
import {BookListComponent} from '../../shared/book-list/book-list.component';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';

@Component({
  standalone: true,
  selector: 'my-library',
  templateUrl: './my-library.component.html',
  imports: [TableModule, BookListComponent, Button, RouterLink, ConfirmDialog],
  providers: [ConfirmationService]
})
export class MyLibraryComponent implements OnInit {

  books: Book[] = [];

  protected readonly bookService = inject(BookService);
  protected readonly confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAll().then(books => this.books = books);
  }

  protected changeFavorite($event: number) {
    void this.bookService.changeFavorite($event);
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
}
