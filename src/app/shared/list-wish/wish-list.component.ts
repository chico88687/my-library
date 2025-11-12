import {Component, EventEmitter, Input, Output} from '@angular/core';
import {WishListItem} from '../../database/tables/wish-list-item';
import {BookAvatarComponent} from '../book-avatar/book-avatar.component';
import {Button} from 'primeng/button';
import {DataView} from 'primeng/dataview';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RouterLink} from '@angular/router';
import {Category} from '../../database/tables/category';

@Component({
  standalone: true,
  selector: 'wish-list',
  templateUrl: './wish-list.component.html',
  imports: [
    BookAvatarComponent,
    Button,
    DataView,
    ProgressSpinner,
    RouterLink
  ]
})
export class WishListComponent {

  @Input() wishList: WishListItem[] = [];
  @Input() isLoading: boolean = false;
  @Input() categoryIdMap?: Map<number, Category>;

  @Output() deleteEmitter = new EventEmitter<{ wish: WishListItem, event: Event }>();

  protected deleteWishItem(wish: WishListItem, event: Event): void {
    this.deleteEmitter.emit({wish, event});
  }
}
