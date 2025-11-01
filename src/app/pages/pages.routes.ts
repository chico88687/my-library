import {Routes} from '@angular/router';
import {MyLibraryComponent} from './my-library/my-library.component';
import {UpdateBookComponent} from './update-book/update-book.component';
import {WishListComponent} from './wish-list/wish-list.component';
import {FindBookComponent} from './find-book/find-book.component';

const routes: Routes = [
  {
    path: 'my-books',
    component: MyLibraryComponent,
  },
  {
    path: 'new-book',
    component: UpdateBookComponent
  },
  {
    path: 'update-book/:id',
    component: UpdateBookComponent
  },
  {
    path: 'wish-list',
    component: WishListComponent,
  },
  {
    path: 'find-book',
    component: FindBookComponent,
  }
];

export default routes;
