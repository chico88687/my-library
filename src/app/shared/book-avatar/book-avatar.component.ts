import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Avatar} from 'primeng/avatar';
import {Image} from 'primeng/image';

@Component({
  standalone: true,
  selector: 'book-avatar',
  templateUrl: './book-avatar.component.html',
  imports: [
    Avatar,
    Image
  ]
})
export class BookAvatarComponent implements OnChanges {

  defaultImage: string = 'content/images/book.png';

  @Input() base64Image?: string;
  showDefaultImage: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    this.showDefaultImage = !(Object.hasOwn(changes, 'base64Image') && this.base64Image);
  }
}
