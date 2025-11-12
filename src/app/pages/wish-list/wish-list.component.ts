import {Component} from '@angular/core';
import {PageHeaderComponent} from '../../shared/page-header/page-header.component';
import {BookListComponent} from '../../shared/book-list/book-list.component';
import {Button} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {ListOptionsComponent} from '../../shared/list-options/list-options.component';
import {RouterLink} from '@angular/router';
import {ListWishComponent} from '../../shared/list-wish/list-wish.component';

@Component({
  standalone: true,
  selector: 'wish-list',
  templateUrl: './wish-list.component.html',
  imports: [
    PageHeaderComponent,
    BookListComponent,
    Button,
    FormsModule,
    InputText,
    ListOptionsComponent,
    RouterLink,
    ListWishComponent
  ]
})
export class WishListComponent {

}
