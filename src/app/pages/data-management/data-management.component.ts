import {Component, inject} from '@angular/core';
import {Button} from 'primeng/button';
import {FileUpload, FileUploadHandlerEvent} from 'primeng/fileupload';
import {ImportService} from '../../service/import/import.service';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  standalone: true,
  selector: 'data-management',
  templateUrl: './data-management.component.html',
  imports: [
    Button,
    FileUpload,
    ProgressSpinner
  ]
})
export class DataManagementComponent {

  entities: string[] = ['Books', 'Wish List', 'Categories'];
  isLoading = false;

  private readonly importService: ImportService = inject(ImportService);

  protected import($event: FileUploadHandlerEvent): void {
    this.isLoading = true;
    const file: File = $event.files[0];
    if (!file) {
      return;
    }
    this.importService.importBooks(file).then(() => this.isLoading = false);
  }

  protected onFileSelect($event: FileUploadHandlerEvent) {

  }
}
