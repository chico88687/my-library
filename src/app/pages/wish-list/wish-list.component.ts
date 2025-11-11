import {Component} from '@angular/core';
import {PageHeaderComponent} from '../../shared/page-header/page-header.component';

@Component({
  standalone: true,
  selector: 'wish-list',
  templateUrl: './wish-list.component.html',
  imports: [
    PageHeaderComponent
  ]
})
export class WishListComponent {}
