import {EventEmitter, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import {AlertController, ModalController, Platform} from "ionic-angular";
import {NativeStorage} from "@ionic-native/native-storage";
import {File} from '@ionic-native/file';
import {default as Utils} from "../../utils/utils";

export class BaseRecovery implements OnChanges {

  @Output() recordCount = new EventEmitter();
  @Input() searchTxt;

  protected keyPrefix: string;
  protected isMobile: boolean;
  protected expandedCardId;
  protected gamesRecords: Array<any>;
  protected timeControls = {};

  constructor(public storage: NativeStorage,
              public file: File,
              public platform: Platform,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController) {
    const me = this;
    me.isMobile = me.platform.is('android') || me.platform.is('cordova');
    me.timeControls = Utils.mapTimeControls();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const me = this;
    const searchTxt = changes['searchTxt'];
    if (searchTxt && !searchTxt.firstChange) me.initialize();
  }


  // ----------------------------------- HOOKS
  protected reset(): void {
  }

  protected checkRecordName(value): boolean {
    return true;
  }

  protected deleteBackup(game): void {
  }

  protected saveToFile(game): void {
  }

  protected initialize(): void {
    const me = this;

    me.reset();
    me.storage.keys().then(keys => {
      for (let key of keys) {
        const isRecord = key.indexOf(me.keyPrefix) != -1;
        if (isRecord) {
          me.storage.getItem(key).then(value => {
            if (me.checkRecordName(value)) {
              me.gamesRecords.unshift(value);
              me.recordCount.emit(me.gamesRecords.length);
            }
          });
        }
      }
    });
  }

  protected checkSearch(gameName) {
    const me = this;
    const txt = me.searchTxt;
    const name = gameName ? gameName.toLowerCase() : '';

    if (!txt || !name) return true;
    if (txt == '') return true;
    return name.includes(txt.toLowerCase());
  }

  protected getGameInfo(data, key) {
    const me = this;
    const game = data['game'];
    return game[key];
  }

  protected getTimeControl(data) {
    const me = this;
    const game = data['game'];
    const timeControl = game['time_control'];
    return me.timeControls[timeControl];
  }

  protected attemptDelete(gameBackup) {
    const me = this;
    const message = 'Do you want to delete the backup of this game?';
    const callback = () => {
      me.deleteBackup(gameBackup);
    };
    me.showConfirmationAlert(message, callback);
  }

  protected deleteGameStorageBackup(gameKey) {
    const me = this;
    me.storage.remove(gameKey).then(() => me.initialize());
  }

  protected saveGameToFile(dirPath, fileName, gameBackup) {
    const me = this;
    me.file.createFile(dirPath, fileName, true)
      .then(() => {
        const data = JSON.stringify(gameBackup);
        me.file.writeFile(dirPath, fileName, data, {replace: true})
          .then(() => me.deleteBackup(gameBackup));
      });
  }

  protected attemptSaveToFile(gameBackup) {
    const me = this;
    const message = 'Are you sure you want to move this game to local disk?';
    const callback = () => {
      me.saveToFile(gameBackup);
    };
    me.showConfirmationAlert(message, callback);
  }

  protected showConfirmationAlert(message, callback): void {
    const me = this;

    let alert = me.alertCtrl.create({
      title: 'Confirmation required',
      message: message,
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
            callback();
          }
        }
      ]
    });
    alert.present();
  }

}
