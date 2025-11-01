import {Component, inject, OnInit} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {Tab, TabList, Tabs} from 'primeng/tabs';
import {UserSettingsService} from './service/database/user-settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Tab, TabList, Tabs, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  tabs = [
    {route: 'my-library', label: 'My Books', icon: 'pi pi-book'},
    {route: 'new-book', label: 'Add a Book', icon: 'pi pi-plus'},
    {route: 'wish-list', label: 'My Wish List', icon: 'pi pi-list'},
    {route: 'find-book', label: 'Find my Next Book', icon: 'pi pi-search'}
  ];

  protected readonly userSettingsService = inject(UserSettingsService);

  ngOnInit(): void {
    void this.userSettingsService.initialize();
  }
}
