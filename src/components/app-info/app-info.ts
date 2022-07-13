import {Component} from "@angular/core";
import {ViewController} from "ionic-angular";
import {NativeStorage} from "@ionic-native/native-storage";
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {AppVersion} from '@ionic-native/app-version';

@Component({
  selector: "app-info",
  templateUrl: "app-info.html"
})
export class AppInfo {

  noShowAgain: boolean;

  constructor(public viewCtrl: ViewController,
              public storage: NativeStorage,
              public appVersion: AppVersion,
              public iab: InAppBrowser) {
  }

  onConnectClick() {
    const me = this;
    me.closeModal();
  }

  onSingUpClick() {
    const me = this;
    me.iab.create("https://app.no/signup/", '_system');
    me.closeModal(true);
  }

  onCancelClick() {
    const me = this;
    me.closeModal(true);
  }

  closeModal(redirect?) {
    const me = this;

    me.appVersion.getVersionCode().then(version => {
      if (me.noShowAgain) me.storage.setItem('app:show_tournament_info_version', version);
    }).catch(() => console.log("Error"));
    me.viewCtrl.dismiss({cancel: redirect});

  }
}
