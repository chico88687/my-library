import {Component} from '@angular/core';
import {PageHeaderComponent} from '../../shared/page-header/page-header.component';
import {Button} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {ListOptionsComponent} from '../../shared/list-options/list-options.component';
import {RouterLink} from '@angular/router';
import {WishListComponent} from '../../shared/list-wish/wish-list.component';

@Component({
  standalone: true,
  selector: 'wishes-component',
  templateUrl: './wishes.component.html',
  imports: [
    PageHeaderComponent,
    Button,
    FormsModule,
    InputText,
    ListOptionsComponent,
    RouterLink,
    WishListComponent
  ]
})
export class WishesComponent {

}
