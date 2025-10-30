import {Component, inject, OnInit} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {Tab, TabList, Tabs} from 'primeng/tabs';
import {UserSettings} from './database/tables/user-settings';
import {UserSettingsService} from './service/user-settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Tab, TabList, Tabs, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  userSettings?: UserSettings;
  userAlreadyCreated = false;

  tabs = [
    {route: 'my-books', label: 'My Books', icon: 'pi pi-book'},
    {route: 'new-book', label: 'Add a Book', icon: 'pi pi-plus'},
    {route: 'wish-list', label: 'My Wish List', icon: 'pi pi-list'},
    {route: 'find-book', label: 'Find my Next Book', icon: 'pi pi-search'}
  ];

  private readonly userSettingsService = inject(UserSettingsService);

  ngOnInit(): void {
    void this.loadUser();
    if (this.userSettings?.id) {
      this.userAlreadyCreated = true;
    }
  }

  private async loadUser(): Promise<void> {
    this.userSettings = await this.userSettingsService.getUser();
  }
}
