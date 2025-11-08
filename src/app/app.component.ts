import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {UserSettingsService} from './service/database/user-settings.service';
import {NavBarComponent} from './shared/nav-bar/nav-bar.component';
import {AlertComponent} from './shared/alert/alert.component';
import {StatusBar, Style} from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent, AlertComponent, AlertComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  protected readonly userSettingsService = inject(UserSettingsService);

  ngOnInit(): void {
    StatusBar.setStyle({ style: Style.Dark })
      .catch(err => console.warn('StatusBar style error', err));

    StatusBar.setOverlaysWebView({ overlay: false })
      .catch(err => console.warn('StatusBar overlay error', err));

    void this.userSettingsService.initialize();
  }

}
