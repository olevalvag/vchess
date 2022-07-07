import {Component, Input} from "@angular/core";
import {ViewController} from "ionic-angular";
import Utils, {Game} from "../../utils/utils";
import {GoogleAnalytics} from '@ionic-native/google-analytics';

@Component({
  selector: "time-controls",
  templateUrl: "time_controls.html"
})
export class TimeControls {

  @Input() game: Game;
  protected timeControls = new Array<any>();

  constructor(public viewCtrl: ViewController, public ga: GoogleAnalytics) {
    const me = this;
    me.timeControls = Utils.visualTimeControls();
  }

  onTimeControlSelect(label) {
    const me = this;
    Utils.sendEventToGA(me.ga, 'Time Control', 'Selected', '', label)
  }

}
