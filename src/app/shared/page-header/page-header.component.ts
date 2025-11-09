import {Component, Input} from '@angular/core';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';
import {TableModule} from 'primeng/table';

@Component({
    standalone: true,
    selector: 'page-header',
    templateUrl: './page-header.component.html',
    imports: [
      Button,
      RouterLink,
      TableModule
    ]
  }
)
export class PageHeaderComponent {

  @Input() title: string = 'My Library';
}
