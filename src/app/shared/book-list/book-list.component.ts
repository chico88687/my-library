import {Component, Input} from '@angular/core';
import {Book} from '../../database/tables/book';
import {TableModule} from 'primeng/table';
import {DataView} from 'primeng/dataview';
import {BookAvatarComponent} from '../book-avatar/book-avatar.component';
import {Rating} from 'primeng/rating';
import {FormsModule} from '@angular/forms';

@Component({
  standalone: true,
  selector: 'book-list',
  templateUrl: './book-list.component.html',
  imports: [
    TableModule,
    DataView,
    BookAvatarComponent,
    Rating,
    FormsModule,


  ]
})
export class BookListComponent {

  @Input() books: Book[] = [];
}
