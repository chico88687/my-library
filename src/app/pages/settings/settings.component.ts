import {Component} from '@angular/core';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {DataManagementComponent} from '../data-management/data-management.component';
import {UpdateUserSettingsComponent} from '../../shared/update-user-settings/update-user-settings.component';

@Component({
    standalone: true,
    selector: 'app-settings',
    templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
      Tabs,
      Tab,
      TabPanels,
      TabPanel,
      TabList,
      DataManagementComponent,
      UpdateUserSettingsComponent
    ]
  }
)
export class SettingsComponent {

}
