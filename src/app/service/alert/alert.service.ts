import {inject, Injectable} from '@angular/core';
import {MessageService} from 'primeng/api';

@Injectable({providedIn: 'root'})
export class AlertService {

  private readonly messageService = inject(MessageService);

  addAlert(severity: string, summary: string, detail: string): void {
    this.messageService.add({severity, summary, detail, key: 'alert'});
  }
}
