import {Component, inject} from '@angular/core';
import {Button} from 'primeng/button';
import {FileUpload, FileUploadHandlerEvent} from 'primeng/fileupload';
import {ImportService} from '../../service/data-management/import/import.service';
import {ProgressSpinner} from 'primeng/progressspinner';
import {AlertService} from '../../service/alert/alert.service';
import {ExportService} from '../../service/data-management/export/export.service';
import {DataManagementService} from '../../service/data-management/data-management.service';
import {ConfirmationService} from 'primeng/api';
import {ConfirmDialog} from 'primeng/confirmdialog';

@Component({
  standalone: true,
  selector: 'data-management',
  templateUrl: './data-management.component.html',
  imports: [
    Button,
    FileUpload,
    ProgressSpinner,
    ConfirmDialog
  ],
  providers: [ConfirmationService]
})
export class DataManagementComponent {

  entities: string[] = ['Books', 'Wish List', 'Categories'];
  isLoading = false;

  private readonly importService: ImportService = inject(ImportService);
  private readonly exportService: ExportService = inject(ExportService);
  private readonly alertService: AlertService = inject(AlertService);
  private readonly dataManagementService = inject(DataManagementService);
  private readonly confirmationService = inject(ConfirmationService);

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

  protected confirmDelete(event: Event): void {
    const message = 'Are you sure you want to proceed? This will delete all Books, Wish List Items and Categories';
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        void this.deleteAllData()
      },
    });
  }

  protected async deleteAllData(): Promise<void> {
    this.isLoading = true;
    await this.dataManagementService.deleteAllContentTables();
    this.isLoading = false
  }
}
