import {Component, OnDestroy, ViewChild} from '@angular/core';
import {Events, ModalController, Nav, Navbar, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HomePage} from '../pages/home/home';
import {TournamentPage} from "../pages/tournament/tournament";
import {AboutPage} from "../pages/about/about";
import {BatteryStatus, BatteryStatusResponse} from "@ionic-native/battery-status";
import Utils from "../utils/utils";
import {RecoveryPage} from "../pages/recovery/recovery";
import {DuContact} from "../components/du-contact/du-contact";
import {QuickGamePage} from "../pages/quick-game-page/quick-game-page";
import {NetworkInterface} from "@ionic-native/network-interface";
import {Network} from "@ionic-native/network";
import {Subject} from "rxjs/Subject";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {takeUntil} from "rxjs/operators";
import {PID_Page} from "../pages/pid/pid";


@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnDestroy {

  @ViewChild(Nav) nav: Nav;
  rootPage: any = HomePage;
  pages: Array<{ title: string, component: any, root: boolean }>;
  private batteryListener: any;
  private subscriptions: Subject<boolean> = new Subject<boolean>();

  constructor(public platform: Platform,
              public networkInterface: NetworkInterface,
              public batteryStatus: BatteryStatus,
              public network: Network,
              public statusBar: StatusBar,
              public modalCtrl: ModalController,
              public ga: GoogleAnalytics,
              public splashScreen: SplashScreen,
              public events: Events) {
    const me = this;
    me.pages = [
      {title: 'Tournament', component: TournamentPage, root: false},
      {title: 'Quick Game', component: QuickGamePage, root: false},
      {title: 'Recovery', component: RecoveryPage, root: false},
      {title: 'PID', component: PID_Page, root: false},
      {title: 'About', component: AboutPage, root: false},
    ];
    me.initializeApp();
  }

  ngOnDestroy(): void {
    const me = this;
    me.subscriptions.next(true);
    me.subscriptions.unsubscribe();
  }

  initializeApp() {
    const me = this;
    me.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      setTimeout(() => me.splashScreen.hide(), 1000);
      me.statusBar.styleDefault();
      me.statusBar.hide();

      // Battery setup
      me.batteryListener = me.batteryStatus.onChange();
      me.batteryListener
        .pipe(takeUntil(me.subscriptions))
        .subscribe((status: BatteryStatusResponse) => {
          // const currentCharge = status.level || 0;
          Utils.batteryStatus = status;
        });

      me.updateIpAddress();
      me.startGoogleAnalytics();
      me.network.onConnect()
        .pipe(takeUntil(me.subscriptions))
        .subscribe(() => me.updateIpAddress());

      me.events.publish('app:check_PID-EULA');
    });
  }

  openPage(page) {
    const me = this;
    if (page.root) {
      me.nav.setRoot(page.component);
    } else {
      me.nav.push(page.component);
    }
  }

  protected showEasterEgg() {
    const me = this;
    let popup = me.modalCtrl.create(DuContact, {}, {enableBackdropDismiss: true});
    popup.present();
  }

  private startGoogleAnalytics() {
    const me = this;
    const GA_KEY = 'UA-114034337-3';
    try {
      me.ga.startTrackerWithId(GA_KEY);
    } catch (e) {
      console.log("Error with Google Analytics");
    }
  }

  private updateIpAddress(): void {
    const me = this;
    const isMobile = me.platform.is('android') || me.platform.is('cordova');
    if (isMobile) {
      me.networkInterface.getWiFiIPAddress().then(x => Utils.IP_ADDRESS = x.ip);
    }
  }

}

