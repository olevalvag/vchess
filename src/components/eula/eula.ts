import {Component} from "@angular/core";
import {Platform, ViewController} from "ionic-angular";
import {NativeStorage} from "@ionic-native/native-storage";
import {APP_EULA} from "../../utils/utils";

@Component({
  selector: "eula",
  templateUrl: "eula.html"
})
export class EulaComponent {

  public unregisterBackButtonAction: any;

  constructor(public viewCtrl: ViewController,
              public storage: NativeStorage,
              public platform: Platform) {
    const me = this;
    me.initializeBackButtonCustomHandler();
  }

  initializeBackButtonCustomHandler(): void {
    const me = this;
    me.unregisterBackButtonAction = me.platform.registerBackButtonAction(function (event) {
    }, 101);
  }

  ionViewWillLeave() {
    const me = this;
    // Unregister the custom back button action for this page
    me.unregisterBackButtonAction && me.unregisterBackButtonAction();
  }

  closeModal() {
    const me = this;
    me.storage.setItem(APP_EULA, true);
    me.viewCtrl.dismiss();
  }
}
