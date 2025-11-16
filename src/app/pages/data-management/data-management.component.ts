import {Component, inject} from '@angular/core';
import {Button} from 'primeng/button';
import {FileUpload, FileUploadHandlerEvent} from 'primeng/fileupload';
import {ImportService} from '../../service/data-management/import/import.service';
import {ProgressSpinner} from 'primeng/progressspinner';
import {AlertService} from '../../service/alert/alert.service';
import {ExportService} from '../../service/data-management/export/export.service';

@Component({
  standalone: true,
  selector: 'data-management',
  templateUrl: './data-management.component.html',
  imports: [
    Button,
    FileUpload,
    ProgressSpinner
  ],
})
export class DataManagementComponent {

  entities: string[] = ['Books', 'Wish List', 'Categories'];
  isLoading = false;

  private readonly importService: ImportService = inject(ImportService);
  private readonly exportService: ExportService = inject(ExportService);
  private readonly alertService: AlertService = inject(AlertService);

  protected async import($event: FileUploadHandlerEvent): Promise<void> {
    this.isLoading = true;
    const file: File = $event.files[0];
    if (!file) {
      return;
    }
    try {
      await this.importService.importBooks(file);
      this.isLoading = false
    } catch (error) {
      if (error instanceof Error) {
        this.alertService.addAlert('error', `Error occurred while importing ${file.name}: ${error.message}`);
      } else {
        this.alertService.addAlert('error', `Error occurred while importing ${file.name}`);
      }
      this.isLoading = false
    }
  }

  protected async export(): Promise<void> {
    this.isLoading = true;
    try {
      await this.exportService.exportBooks();
      this.isLoading = false
    } catch (error) {
      if (error instanceof Error) {
        this.alertService.addAlert('error', `Error occurred while exporting books: ${error.message}`);
      } else {
        this.alertService.addAlert('error', `Error occurred while exporting books.`);
      }
      this.isLoading = false
    }
  }
}
