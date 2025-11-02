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
    {route: 'wish-list', label: 'My Wish List', icon: 'pi pi-shopping-bag'},
    {route: 'category-list', label: 'Categories', icon: 'pi pi-tag'},
    {route: 'find-book', label: 'Find my Next Book', icon: 'pi pi-search'}
  ];
}
