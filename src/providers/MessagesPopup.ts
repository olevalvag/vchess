import {Injectable} from "@angular/core";
import {AlertController} from "ionic-angular";

@Injectable()
export class MessagesPopup {

  constructor(public alertCtrl: AlertController,) {
  }

  public showErrorAlert(message) {
    const me = this;
    let alert = me.alertCtrl.create({
      title: 'Error',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

}
