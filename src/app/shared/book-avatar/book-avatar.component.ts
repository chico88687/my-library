import {Component} from '@angular/core';
import {Avatar} from 'primeng/avatar';

@Component({
  standalone: true,
  selector: 'book-avatar',
  templateUrl: './book-avatar.component.html',
  imports: [
    Avatar
  ]
})
export class BookAvatarComponent {

  defaultImage: string = 'content/images/book.png';
}
