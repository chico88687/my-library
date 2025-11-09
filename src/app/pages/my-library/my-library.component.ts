import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {BookFilter, BookService} from '../../service/database/book.service';
import {Book} from '../../database/tables/book';
import {TableModule} from 'primeng/table';
import {BookListComponent} from '../../shared/book-list/book-list.component';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {ListOptionsComponent} from '../../shared/list-options/list-options.component';
import {SortState} from '../../shared/sort-state/sort-state';
import {FloatLabel} from 'primeng/floatlabel';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Subject, debounceTime, distinctUntilChanged, takeUntil} from 'rxjs';
import {PageHeaderComponent} from '../../shared/page-header/page-header.component';

@Component({
  standalone: true,
  selector: 'my-library',
  templateUrl: './my-library.component.html',
  styleUrls: ['./my-library.component.scss'],
  imports: [TableModule, BookListComponent, Button, RouterLink, ConfirmDialog, ListOptionsComponent, FloatLabel, FormsModule, InputText, PageHeaderComponent],
  providers: [ConfirmationService]
})
export class MyLibraryComponent implements OnInit, OnDestroy {

  books: Book[] = [];

  fieldAndLabelSortMap: Map<string, string> = new Map();

  sortState: SortState = {predicate: 'title', order: 'asc'};
  bookFilter: BookFilter = {};
  isLoading: boolean = false;

  protected readonly bookService = inject(BookService);
  protected readonly confirmationService = inject(ConfirmationService);

  // Debounce search input
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // wait 300 ms after the user stops typing
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.loadBooks());
    this.buildSortMap()
    this.loadBooks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBooks(shouldShowLoading: boolean = true): void {
    this.isLoading = shouldShowLoading;
    this.bookService.getAll(this.sortState, this.bookFilter).then(books => {
      this.books = books
      this.isLoading = false;
    });
  }

  protected sortBooks($event: SortState): void {
    this.sortState = $event;
    this.loadBooks();
  }

  protected changeFavorite($event: number): void {
    this.bookService.updateFavorite($event).then(() => this.loadBooks(false));
  }

  protected changeWasRead($event: number): void {
    this.bookService.updateWasRead($event).then(() => this.loadBooks(false));
  }

  protected updateRating($event: { book: Book; rating: number }): void {
    const bookId = $event.book.id!;
    const rating = $event.rating;
    this.bookService.updateRating(bookId, rating).then(() => this.loadBooks(false));
  }

  protected search(value: string): void {
    this.searchSubject.next(value);
  }

  protected filterByFavorite(): void {
    this.bookFilter.isFavorite = this.bookFilter.isFavorite ? undefined : true;
    this.loadBooks();
  }

  protected filterByRead(): void {
    this.bookFilter.wasRead = this.bookFilter.wasRead ? undefined : true;
    this.loadBooks();
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
