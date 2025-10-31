import {Component, inject, OnInit} from '@angular/core';
import {BookService} from '../../service/database/book.service';
import {Book} from '../../database/tables/book';
import {TableModule} from 'primeng/table';

@Component({
  standalone: true,
  selector: 'my-books',
  templateUrl: './my-books.component.html',
  imports: [TableModule]
})
export class MyBooksComponent implements OnInit {

  books: Book[] = [];

  protected readonly bookService = inject(BookService);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAll().then(books => this.books = books);
  }
}
