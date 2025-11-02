import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {Tab, TabList, Tabs} from 'primeng/tabs';

@Component({
  standalone: true,
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  imports: [
    RouterLink,
    Tab,
    TabList,
    Tabs
  ],
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  tabs = [
    {route: 'my-library', label: 'My Library', icon: 'pi pi-book'},
    {route: 'new-book', label: 'Add a Book', icon: 'pi pi-plus'},
    {route: 'wish-list', label: 'My Wish List', icon: 'pi pi-list'},
    {route: 'find-book', label: 'Find my Next Book', icon: 'pi pi-search'}
  ];
}
