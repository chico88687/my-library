import {Component} from '@angular/core';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  standalone: true,
  selector: 'alert-component',
  template: '<p-toast key="alert"/>',
  imports: [
    Toast
  ],
})
export class AlertComponent {}
