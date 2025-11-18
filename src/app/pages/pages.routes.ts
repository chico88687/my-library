import {Routes} from '@angular/router';
import {MyLibraryComponent} from './my-library/my-library.component';
import {UpdateBookComponent} from './update-book/update-book.component';
import {WishesComponent} from './wish-list/wishes.component';
import {BookRecommendationComponent} from './book-recommendation/book-recommendation.component';
import {UpdateUserSettingsComponent} from '../shared/update-user-settings/update-user-settings.component';
import {CategoryListComponent} from './category-list/category-list.component';
import {UpdateWishListItemComponent} from './update-wish-list-item/update-wish-list-item.component';
import {SettingsComponent} from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'my-library',
    pathMatch: 'full',
  },

  {
    path: 'my-library',
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
    component: WishesComponent,
  },
  {
    path: 'new-wish-item',
    component: UpdateWishListItemComponent
  },
  {
    path: 'update-wish-item/:id',
    component: UpdateWishListItemComponent
  },
  {
    path: 'category-list',
    component: CategoryListComponent
  },
  {
    path: 'book-recommendation',
    component: BookRecommendationComponent,
  },
  {
    path: 'update-user-settings',
    component: UpdateUserSettingsComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  }
];

export default routes;
