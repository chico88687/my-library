import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {Tab, TabList, Tabs} from 'primeng/tabs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Tab, TabList, Tabs, RouterLink],
  templateUrl: './app.component.html',
})
export class AppComponent {
  tabs = [
    { route: 'my-books', label: 'My Books', icon: 'pi pi-book' },
    { route: 'new-book', label: 'Add a Book', icon: 'pi pi-plus' },
    { route: 'wish-list', label: 'My Wish List', icon: 'pi pi-list' },
    { route: 'find-book', label: 'Find my Next Book', icon: 'pi pi-search' }
  ];
}
