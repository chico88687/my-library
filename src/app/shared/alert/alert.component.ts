import {Component, inject} from '@angular/core';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  standalone: true,
  selector: 'alert-component',
  templateUrl: './alert.component.html',
  imports: [
    Toast
  ],
})
export class AlertComponent {


}
