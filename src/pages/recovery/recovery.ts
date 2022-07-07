import {Component} from "@angular/core";
import {AlertController, ModalController, Platform} from "ionic-angular";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {
  BACKUP_DIR_PATH,
  APP_DIR,
  APP_STORAGE,
  default as Utils,
  QUICK_GAME,
  QuickGameBackup,
  TournamentBackup
} from "../../utils/utils";
import {File} from "@ionic-native/file";
import {NativeStorage} from "@ionic-native/native-storage";
import {GoogleAnalytics} from '@ionic-native/google-analytics';

@Component({
  selector: "recovery-page",
  templateUrl: "recovery.html"
})
export class RecoveryPage {

  protected diskMode: boolean;
  protected tournamentStorageCount: number = 0;
  protected quickGameCount: number = 0;
  protected searchTxt: string;
  protected isMobileDevice: boolean;

  protected tournamentsRecords: Array<TournamentBackup>;
  protected quickGameRecords: Array<QuickGameBackup>;

  constructor(public file: File,
              public platform: Platform,
              public alertCtrl: AlertController,
              public screenOrientation: ScreenOrientation,
              public modalCtrl: ModalController,
              public storage: NativeStorage,
              public ga: GoogleAnalytics) {
    const me = this;
    me.isMobileDevice = me.platform.is('android') || me.platform.is('cordova');
  }

  ionViewWillEnter() {
    const me = this;
    me.diskMode = true;
    me.lockScreenPortrait();
    Utils.sendViewTagtoGA(me.ga, 'recovery_page');
  }

  ionViewDidEnter() {
    const me = this;
    me.diskMode = false;
  }

  private lockScreenPortrait() {
    const me = this;
    me.screenOrientation
      .lock(me.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY)
      .catch(console.error);
  }

  protected updateQuickGameCount(count: number) {
    const me = this;
    me.quickGameCount = count;
  }

  protected updateTournamentCount(count: number) {
    const me = this;
    me.tournamentStorageCount = count;
  }

  // ---------------------------------- DISK MODE
  protected showDiskMode() {
    const me = this;
    if (me.diskMode && me.isMobileDevice) me.retrieveLocalFiles();
  }

  protected viewDate(timestamp): string {
    return Utils.formatUtcDateTimestamp(timestamp);
  }

  protected retrieveLocalFiles() {
    const me = this;
    let data;
    const dirPath = `${me.file.externalDataDirectory}${APP_DIR}`;
    const tournamentPrefix = APP_STORAGE;
    const quickGamePrefix = QUICK_GAME;

    me.tournamentsRecords = new Array<TournamentBackup>();
    me.quickGameRecords = new Array<QuickGameBackup>();

    me.file.listDir(dirPath, BACKUP_DIR_PATH).then(entries => {
      entries.forEach((value) => {
        const name = value.name;
        const isTournament = name.indexOf(tournamentPrefix) != -1;
        const isQuickGame = name.indexOf(quickGamePrefix) != -1;

        me.file.readAsText(dirPath + '/' + BACKUP_DIR_PATH, name).then((fileData) => {
          if (isTournament) {
            data = JSON.parse(fileData) as TournamentBackup;
            data['FILE_NAME'] = name;
            me.tournamentsRecords.push(data);
          }
          if (isQuickGame) {
            data = JSON.parse(fileData) as QuickGameBackup;
            data['FILE_NAME'] = name;
            me.quickGameRecords.push(data);
          }
        });

      });
    });
  }

  protected moveTournamentStorage(backup: TournamentBackup) {
    const me = this;
    const key = `${APP_STORAGE}${backup.tournament.unique_id}`;
    me.storage.setItem(key, backup).then(() => me.deleteFile(backup));
  }

  protected moveQuickGameStorage(backup: QuickGameBackup) {
    const me = this;
    me.storage.setItem(backup.key, backup).then(() => me.deleteFile(backup));
  }

  protected onDeleteAll() {
    const me = this;
    let alert = me.alertCtrl.create({
      title: 'Delete local storage',
      message: 'Are you sure to delete all entries in local storage?',
      cssClass: 'app-alert',
      enableBackdropDismiss: true,
      buttons: [
        {
          text: 'No',
          cssClass: 'cancel_btn',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          cssClass: 'ok_btn',
          handler: () => {
            me.diskMode = true;
            me.storage.clear().then(() => me.diskMode = false);
          }
        }
      ]
    });
    alert.present();
  }

  private deleteFile(backupData) {
    const me = this;
    const fileName = backupData['FILE_NAME'];
    const dirPath = `${me.file.externalDataDirectory}${APP_DIR}/${BACKUP_DIR_PATH}`;
    me.file.removeFile(dirPath, fileName).then(() => me.retrieveLocalFiles())
  }

}
