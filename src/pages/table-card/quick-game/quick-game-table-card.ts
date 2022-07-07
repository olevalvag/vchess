import {Component, OnDestroy} from "@angular/core";
import {AlertController, ModalController, NavController, NavParams} from "ionic-angular";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {default as Utils, QuickGame} from "../../../utils/utils";
import {Insomnia} from "@ionic-native/insomnia";
import {TableCard} from "../table-card";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {Brightness} from "@ionic-native/brightness";
import {createQuickGame} from "../../../view-factories/quickgame-factory";


@Component({
  selector: "quick-game-table-card",
  templateUrl: "../table-card.html"
})
export class QuickGameTableCard extends TableCard implements OnDestroy {

  constructor(public insomnia: Insomnia,
              public screenOrientation: ScreenOrientation,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public modalCtrl: ModalController,
              public navParams: NavParams,
              public ga: GoogleAnalytics,
              public brightness: Brightness) {
    super(insomnia, screenOrientation, alertCtrl, navCtrl, modalCtrl, navParams, brightness);
    const me = this;
    me.game = navParams.get("game");
    me.layoutConfig = navParams.get("layoutConfig");
    me.viewConfig = navParams.get("viewConfig");
    me.game as QuickGame;
  }

  ionViewWillEnter() {
    const me = this;
    Utils.sendViewTagtoGA(me.ga, 'quick_game_table_card_page');
  }

  public onPlayerReadyChange() {
    const me = this;
    const whiteReady = me.whiteStatus;
    const blackReady = me.blackStatus;
    if (whiteReady.ready && blackReady.ready) {
      me.redirectToGame();
    }
  }

  public onSinglePlayerReadyClick() {
    const me = this;
    me.redirectToGame();
  }

  private redirectToGame() {
    const me = this;
    const view = createQuickGame(me.game);
    const params = {
      game: me.game,
      viewConfig: me.viewConfig,
      layoutConfig: me.layoutConfig
    };

    me.useDefaultClockTemplate();
    me.onPageLeave();

    me.navCtrl.push(view, params).then(() => {
      const index = me.navCtrl.getActive().index;
      me.navCtrl.remove(index - 2, 2);
    });
  }

}
