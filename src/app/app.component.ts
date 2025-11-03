import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {UserSettingsService} from './service/database/user-settings.service';
import {NavBarComponent} from './shared/nav-bar/nav-bar.component';
import {AlertComponent} from './shared/alert/alert.component';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent, AlertComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  protected readonly userSettingsService = inject(UserSettingsService);

  ngOnInit(): void {
    void this.userSettingsService.initialize();
  }
}
