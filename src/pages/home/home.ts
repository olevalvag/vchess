import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {
  AlertController,
  Events,
  ModalController,
  Navbar,
  NavController,
  Platform,
  ToastController
} from "ionic-angular";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {TournamentPage} from "../tournament/tournament";
import {AppVersion} from "@ionic-native/app-version";
import {EulaComponent} from "../../components/eula/eula";
import {NativeStorage} from '@ionic-native/native-storage';
import {
  BACKUP_DIR_PATH,
  APP_DIR,
  APP_EULA,
  APP_STORAGE,
  default as Utils,
  PID_PIN,
  QUICK_GAME
} from "../../utils/utils";
import {File} from "@ionic-native/file";
import {TournamentProvider} from "../../providers/tournament/tournament";
import {QuickGamePage} from "../quick-game-page/quick-game-page";
import {QuickgameProvider} from "../../providers/quicklive/quicklive";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {PID_KEY} from "../../utils/statics";

@Component({
  selector: "home-page",
  templateUrl: "home.html"
})
export class HomePage implements AfterViewInit {

  app_version: string;
  private pidTimer;

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public storage: NativeStorage,
              public toastCtrl: ToastController,
              public tournamentProvider: TournamentProvider,
              public quickgameProvider: QuickgameProvider,
              public file: File,
              public appVersion: AppVersion,
              public platform: Platform,
              public screenOrientation: ScreenOrientation,
              public ga: GoogleAnalytics,
              public modalCtrl: ModalController,
              public events: Events) {
    const me = this;
    me.events.subscribe('app:check_PID-EULA', () => setTimeout(() => me.checkEULA_PID(), 500));
  }

  ionViewWillEnter(): void {
    const me = this;
    me.lockScreenPortrait();
    me.showAppVersion();
    me.createDeviceDirs();
  }

  ngAfterViewInit() {
    const me = this;
    me.tournamentProvider.updateEnvironmentUrls();
    me.quickgameProvider.updateEnvironmentUrls();
  }

  ionViewDidEnter() {
    const me = this;
    me.platform.ready().then(() => {
      Utils.sendViewTagtoGA(me.ga, 'home_page');
    });
  }

  private lockScreenPortrait() {
    const me = this;
    const orientation = me.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY;
    try {
      me.screenOrientation.lock(orientation).catch(console.error);
    } catch (e) {
      console.log("Look not supported");
    }
  }

  private showAppVersion() {
    const me = this;
    me.appVersion.getVersionNumber().then(version => me.app_version = version).catch(console.error);
  }

  public onTournamentPageClick(): void {
    const me = this;
    me.storage.getItem(PID_KEY).then(value => {
      me.navCtrl.push(TournamentPage, {pidCode: value});
    }).catch(() => {
      me.navCtrl.push(TournamentPage);
    });
  }

  public onQuickGameClick(): void {
    const me = this;
    me.navCtrl.push(QuickGamePage);
  }

  protected isTestingEnvironment() {
    return Utils.isProductionEnvironment;
  }

  protected onSwitchEnvironment() {
    const me = this;
    Utils.isProductionEnvironment = !Utils.isProductionEnvironment;
    me.tournamentProvider.updateEnvironmentUrls();
    me.quickgameProvider.updateEnvironmentUrls();

    let toast = me.toastCtrl.create({
      duration: 2500,
      message: `Configured for ${Utils.isProductionEnvironment ? 'production' : 'test'} server`,
      position: 'middle'
    });
    toast.present();
    me.checkTabletPidCode();
  }

  private showEulaModal() {
    const me = this;
    let popup = me.modalCtrl.create(EulaComponent, {}, {cssClass: '', enableBackdropDismiss: false});
    popup.onDidDismiss(() => me.checkTabletPidCode());
    popup.present();
  }

  private createDeviceDirs() {
    const me = this;
    const successCallback = () => {
      me.createBackupDir()
    };
    const errorCallback = () => {
      me.file.createDir(dirPath, APP_DIR, false).then(() => successCallback())
    };
    const dirPath = me.file.externalDataDirectory;

    me.file.checkDir(dirPath, APP_DIR + '/').then(exist => {
      if (exist) successCallback();
      if (!exist) errorCallback();
    }, () => errorCallback());
  }

  private createBackupDir() {
    const me = this;
    const dirPath = `${me.file.externalDataDirectory}${APP_DIR}/`;
    const successCallback = () => me.moveOldBackupsDisk();
    const errorCallback = () => me.file.createDir(dirPath, BACKUP_DIR_PATH, false).then(() => successCallback());

    me.file.checkDir(dirPath, BACKUP_DIR_PATH).then(exist => {
      if (exist) successCallback();
      if (!exist) errorCallback();
    }, () => errorCallback());
  }

  private moveOldBackupsDisk() {
    const me = this;
    let gameTimestamp;
    const backDate = new Date().setDate(new Date().getDate() - 5);
    const quickGameKey = QUICK_GAME;
    const tournamentKey = APP_STORAGE;
    const storageSavedKeys = me.storage.keys();

    storageSavedKeys.then(keys => {
      for (let key of keys) {
        const isGameRecord = key.indexOf(quickGameKey) != -1 || key.indexOf(tournamentKey) != -1;
        if (isGameRecord) {
          me.storage.getItem(key).then(value => {
            gameTimestamp = value['date_timestamp'] ? Number(value['date_timestamp']) : new Date().getTime();
            if (gameTimestamp < backDate) me.saveGameToFile(key, value);
          });
        }
      }
    });
  }

  private saveGameToFile(gameKey, gameBackup) {
    const me = this;
    const dirPath = `${me.file.externalDataDirectory}${APP_DIR}/${BACKUP_DIR_PATH}`;
    const fileName = `${gameKey}.txt`;

    me.file.createFile(dirPath, fileName, true)
      .then(() => {
        const data = JSON.stringify(gameBackup);
        me.file.writeFile(dirPath, fileName, data, {replace: true})
          .then(() => {
            me.storage.remove(gameKey);
          });
      });
  }

  /////////////////////////////////////////////// PID CODE -----------------------

  private checkEULA_PID() {
      const me = this;
    me.storage.getItem(APP_EULA).then(value => me.checkTabletPidCode()).catch(() => me.showEulaModal());
  }

  private checkTabletPidCode() {
    const me = this;
    me.storage.getItem(PID_KEY).then(pidCode => me.checkPidPinCode(pidCode));
  }

  private checkPidPinCode(pidCode) {
    const me = this;
    me.tournamentProvider.fetchPidCode(pidCode).subscribe((response: PID_PIN) => {
      if (response.outcome == 'success' && response.pin) {
        me.showPidAlert(pidCode, response.pin);
      }
    });
  }

  private showPidAlert(pidCode, pinCode) {
    const me = this;
    let time = 10;
    const alertText = () => {
      return `Connecting to tournament. Press Abort to go to regular start page instead. (${time})`;
    };
    const redirect = () => {
      if (me.pidTimer) window.clearInterval(me.pidTimer);
      prompt.dismiss();
      me.navCtrl.push(TournamentPage, {pidCode: pidCode, pinCode: pinCode, quickConnect: true});
    };

    let prompt = me.alertCtrl.create({
      title: `PID and PIN resolved`,
      message: alertText(),
      cssClass: `app-alert overwrite_modal_bg`,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Abort',
          cssClass: 'cancel_btn',
          handler: () => {
            if (me.pidTimer) window.clearInterval(me.pidTimer);
          }
        },
        {
          text: 'Continue',
          cssClass: 'ok_btn',
          handler: () => redirect()
        }
      ]
    });
    prompt.present();

    me.pidTimer = window.setInterval(() => {
      time = Math.max(0, time - 1);
      prompt.setMessage(alertText());
      if (time <= 0) redirect()
    }, 1000);
  }
}
