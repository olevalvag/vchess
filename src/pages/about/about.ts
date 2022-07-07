import {Component} from "@angular/core";
import {default as Utils} from "../../utils/utils";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {Platform} from "ionic-angular";
import {ScreenOrientation} from "@ionic-native/screen-orientation";

@Component({
  selector: "about",
  templateUrl: "about.html"
})
export class AboutPage {

  constructor(public ga: GoogleAnalytics,
              public screenOrientation: ScreenOrientation,
              public platform: Platform) {}

  ngOnInit(): void {
    const me = this;
    const isMobile = me.platform.is('android') || me.platform.is('cordova');

    if (isMobile) {
      me.lockScreenPortrait();
    }
  }

  ionViewDidEnter() {
    const me = this;
    Utils.sendViewTagtoGA(me.ga, 'about_page');
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

}
