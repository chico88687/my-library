import {FileUploadHandlerEvent} from 'primeng/fileupload';
import {inject, Injectable} from '@angular/core';
import {BookService} from '../database/book.service';
import {WishListItemService} from '../database/wish-list-item.service';
import {CategoryService} from '../database/category.service';
import {AlertService} from '../alert/alert.service';
import {UserSettingsService} from '../database/user-settings.service';

@Injectable({providedIn: 'root'})
export class DataDeleteService {

  private readonly alertService = inject(AlertService);
  private readonly bookService = inject(BookService);
  private readonly wishListService = inject(WishListItemService);
  private readonly userSettingsService = inject(UserSettingsService);
  private readonly categoryService = inject(CategoryService);

  async deleteAllContentTables(): Promise<void> {
    try {
      await this.bookService.deleteAll();
      await this.wishListService.deleteAll();
      await this.categoryService.deleteAll();
    } catch (error) {
      if (error instanceof Error) {
        this.alertService.addAlert('error', `Error occurred while deleting all data: ${error.message}`);
      } else {
        this.alertService.addAlert('error', `Error occurred while deleting all data.`);
      }
    }
  }

  async deleteAllAppData(): Promise<void> {
    try {
      await this.deleteAllContentTables();
      await this.userSettingsService.deleteAll();
      this.alertService.addAlert('secondary', 'All data has been deleted successfully.');
    } catch (error) {
      if (error instanceof Error) {
        this.alertService.addAlert('error', `Error occurred while deleting all data: ${error.message}`);
      } else {
        this.alertService.addAlert('error', `Error occurred while deleting all data.`);
      }
    }
  }
}
