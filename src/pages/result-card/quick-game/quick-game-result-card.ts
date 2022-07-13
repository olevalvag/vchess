import {Component, OnDestroy} from "@angular/core";
import {default as Utils, QuickGame} from "../../../utils/utils";
import {Brightness} from "@ionic-native/brightness";
import {AlertController, ModalController, NavController, NavParams} from "ionic-angular";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {Insomnia} from "@ionic-native/insomnia";
import {ResultCard} from "../result-card";
import {QuickgamePgnUpload} from "../../../providers/quicklive/quickgame-pgn-upload";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {createQuickGame} from "../../../view-factories/quickgame-factory";


@Component({
  selector: "quick-game-result-card",
  templateUrl: "../result-card.html"
})
export class QuickGameResultCard extends ResultCard implements OnDestroy {

  constructor(public insomnia: Insomnia,
              public screenOrientation: ScreenOrientation,
              public pgnUploadService: QuickgamePgnUpload,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public modalCtrl: ModalController,
              public navParams: NavParams,
              public brightness: Brightness,
              public ga: GoogleAnalytics) {
    super(insomnia, screenOrientation, pgnUploadService, alertCtrl, navCtrl, modalCtrl, navParams, brightness);
    const me = this;
    me.game = navParams.get("game");
    me.layoutConfig = navParams.get("layoutConfig");
    me.viewConfig = navParams.get("viewConfig");
    me.game as QuickGame;
    me.gameResult = Utils.parseResultFromPgn(me.game['pgn_data']);
    me.showShareBtns = true;
  }

  ionViewWillEnter() {
    const me = this;
    Utils.sendViewTagtoGA(me.ga, 'quick_game_result_card_page');
  }

  hasPendingPgnRequest() {
    const me = this;
    const game = me.game;
    return game.live && me.pgnService.hasPendingPgn();
  }

  onEditGameClick() {
    const me = this;
    const view = createQuickGame(me.game);
    const params = {
      game: me.game,
      viewConfig: me.viewConfig,
      layoutConfig: me.layoutConfig
    };

    me.onPageLeave();

    me.navCtrl.push(view, params).then(() => {
      const index = me.navCtrl.getActive().index;
      me.navCtrl.remove(index - 1, 1);
    });
  }

}
