import {Component, inject} from '@angular/core';
import {DataDeleteService} from '../../service/data-management/data-delete.service';
import {ConfirmationService} from 'primeng/api';
import {Router} from '@angular/router';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {Button} from 'primeng/button';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
    standalone: true,
    selector: 'delete-data',
    templateUrl: './delete-data.component.html',
    imports: [
      ConfirmDialog,
      Button,
      ProgressSpinner
    ],
    providers: [ConfirmationService]
  }
)
export class DeleteDataComponent {

  isLoading = false;

  private readonly dataManagementService = inject(DataDeleteService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  protected confirmContentDataDelete(event: Event): void {
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
        void this.deleteAllContentData()
      },
    });
  }

  protected async deleteAllContentData(): Promise<void> {
    this.isLoading = true;
    await this.dataManagementService.deleteAllContentTables();
    this.isLoading = false
  }

  protected confirmAppDataDelete(event: Event): void {
    const message = 'Are you sure you want to proceed? This will delete all app data including the user settings.';
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
        this.deleteAllAppData()
      },
    });
  }

  protected deleteAllAppData(): void {
    this.isLoading = true;
    this.dataManagementService.deleteAllAppData().then(() => {
      this.isLoading = false;
      void this.router.navigate(['/']);
    });
  }
}
