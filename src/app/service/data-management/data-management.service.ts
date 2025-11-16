import {FileUploadHandlerEvent} from 'primeng/fileupload';
import {inject, Injectable} from '@angular/core';
import {BookService} from '../database/book.service';
import {WishListItemService} from '../database/wish-list-item.service';
import {CategoryService} from '../database/category.service';
import {AlertService} from '../alert/alert.service';

@Injectable({providedIn: 'root'})
export class DataManagementService {

  private readonly alertService = inject(AlertService);
  private readonly bookService = inject(BookService);
  private readonly wishListService = inject(WishListItemService);
  private readonly categoryService = inject(CategoryService);

  async deleteAllContentTables(): Promise<void> {
    try {
      await this.bookService.deleteAll();
      await this.wishListService.deleteAll();
      await this.categoryService.deleteAll();
    } catch (error) {
      if (error instanceof Error) {
        this.alertService.addAlert('error', `Error occurred while exporting books: ${error.message}`);
      } else {
        this.alertService.addAlert('error', `Error occurred while exporting books.`);
      }
    }
  }
}
