import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Book} from '../../database/tables/book';
import {TableModule} from 'primeng/table';
import {DataView} from 'primeng/dataview';
import {BookAvatarComponent} from '../book-avatar/book-avatar.component';
import {Rating} from 'primeng/rating';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';

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
    Button,
    RouterLink,


  ]
})
export class BookListComponent {

  @Input() books: Book[] = [];
  @Output() changeFavoriteEmitter = new EventEmitter<number>();

  protected changeFavorite(id: number): void {
    this.changeFavoriteEmitter.emit(id);
  }
}
