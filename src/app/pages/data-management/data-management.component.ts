import {Component, inject, OnInit} from '@angular/core';
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
export class DataManagementComponent implements OnInit {

  entities: string[] = ['Books', 'Wish List', 'Categories'];
  isLoading = false;

  importMap: Map<string, (file: File) => Promise<number>> = new Map<string, (file: File) => Promise<number>>();

  exportMap: Map<string, () => Promise<void>> = new Map<string, () => Promise<void>>();

  private readonly importService: ImportService = inject(ImportService);
  private readonly exportService: ExportService = inject(ExportService);
  private readonly alertService: AlertService = inject(AlertService);

  ngOnInit(): void {
    this.importMap.set('Books', (file: File) => this.importService.importBooks(file));
    this.importMap.set('Wish List', (file: File) => this.importService.importWishListItems(file));
    this.importMap.set('Categories', (file: File) => this.importService.importCategories(file));

    this.exportMap.set('Books', () => this.exportService.exportBooks());
    this.exportMap.set('Wish List', () => this.exportService.exportWishListItems());
    this.exportMap.set('Categories', () => this.exportService.exportCategories());
  }

  protected async import($event: FileUploadHandlerEvent, entity: string): Promise<void> {
    this.isLoading = true;
    const file: File = $event.files[0];
    if (!file) {
      return;
    }
    try {
      await this.importMap.get(entity)?.(file);
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

  protected async export(entity: string): Promise<void> {
    this.isLoading = true;
    try {
      await this.exportService.exportBooks();
      this.isLoading = false
    } catch (error) {
      if (error instanceof Error) {
        this.alertService.addAlert('error', `Error occurred while exporting ${entity}: ${error.message}`);
      } else {
        this.alertService.addAlert('error', `Error occurred while exporting ${entity}.`);
      }
      this.isLoading = false
    }
  }
}
