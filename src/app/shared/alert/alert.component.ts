import {Component} from '@angular/core';
import {Toast} from 'primeng/toast';

@Component({
  standalone: true,
  selector: 'alert-component',
  template: `
    <p-toast
      key="alert"
      [baseZIndex]="9999"
      [breakpoints]="{
        '435px': { width: '90%', left: '5%', right: '5%' }
      }"
    />
  `,
  imports: [
    Toast
  ],
})
export class AlertComponent {}
