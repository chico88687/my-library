import {Component, Input} from '@angular/core';
import {Book} from '../../database/tables/book';
import {PrimeTemplate} from 'primeng/api';
import {TableModule} from 'primeng/table';

@Component({
  standalone: true,
  selector: 'book-list',
  templateUrl: './book-list.component.html',
  imports: [
    PrimeTemplate,
    TableModule
  ]
})
export class BookListComponent {

  @Input() books: Book[] = [];
}
