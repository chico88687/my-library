import {Component} from '@angular/core';
import {UpdateUserSettingsComponent} from '../shared/update-user-settings/update-user-settings.component';

@Component({
  standalone: true,
  selector: 'set-up-user',
  templateUrl: './set-up-user.component.html',
  imports: [
    UpdateUserSettingsComponent
  ]
})
export class SetUpUserComponent {

}
