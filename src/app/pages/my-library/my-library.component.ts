import {Component, inject, OnInit} from '@angular/core';
import {BookService} from '../../service/database/book.service';
import {Book} from '../../database/tables/book';
import {TableModule} from 'primeng/table';
import {BookListComponent} from '../../shared/book-list/book-list.component';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';

@Component({
  standalone: true,
  selector: 'my-library',
  templateUrl: './my-library.component.html',
  imports: [TableModule, BookListComponent, Button, RouterLink]
})
export class MyLibraryComponent implements OnInit {

  books: Book[] = [];

  protected readonly bookService = inject(BookService);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAll().then(books => this.books = books);
  }
}
