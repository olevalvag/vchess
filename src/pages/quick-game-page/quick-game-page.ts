import {Component, ViewChild} from "@angular/core";
import {Content, ModalController, NavController} from "ionic-angular";
import Utils, {
  EMPTY_FN,
  LayoutConfig,
  ON_GOING_GAME,
  QuickGame,
  SCORESHEET_ONLY_TIME_CONTROL,
  ViewConfig
} from "../../utils/utils";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {QuickGameTableCard} from "../table-card/quick-game/quick-game-table-card";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {createQuickGame} from "../../view-factories/quickgame-factory";
import {classical__90_30} from "../../core/chess/ClockSettings";

@Component({
  selector: "quick-game-page",
  templateUrl: "quick-game-page.html"
})
export class QuickGamePage {

  @ViewChild(Content) content: Content;
  game: QuickGame;
  layoutConfig: LayoutConfig;
  viewConfig: ViewConfig;

  constructor(public navCtrl: NavController,
              public screenOrientation: ScreenOrientation,
              public modalCtrl: ModalController,
              public ga: GoogleAnalytics) {
    const me = this;
    const gameId = Utils.getUTCTimestamp(new Date());
    me.viewConfig = {ping: false, tablet: false, battery: true, showLabels: false};
    me.game = {
      unique_id: gameId,
      result: ON_GOING_GAME,
      time_control: SCORESHEET_ONLY_TIME_CONTROL,
      clockSettings: classical__90_30,
      hashtag: ''
    } as QuickGame;
    me.layoutConfig = {swap_sections: false, swap_sides: false};
  }

  ionViewWillEnter() {
    const me = this;
    me.lockScreenPortrait();
    Utils.sendViewTagtoGA(me.ga, 'quick_game_creation_page');
  }

  private lockScreenPortrait(): void {
    const me = this;
    me.screenOrientation
      .lock(me.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY)
      .catch(console.error);
  }

  scrollInputIntoView(top) {
    const me = this;
    setTimeout(() => {
      const scrollTop = me.content.scrollTop;
      me.content.scrollTop = top - 100;
      // me.content.scrollTo(0, top, 150);
    }, 250);
  }

  protected onFormDoneClick() {
    const me = this;
    me.checkScoresheetOnlyMode();
    me.checkLiveGame();
    me.redirectToGame();
  }

  private redirectToGame() {
    const me = this;
    const game = me.game;
    const params = {
      game: me.game,
      layoutConfig: me.layoutConfig,
      viewConfig: me.viewConfig
    };
    let callback = () => {
      const index = me.navCtrl.getActive().index;
      me.navCtrl.remove(index - 1, 1);
    };
    let view;

    if (game.cards) {
      callback = EMPTY_FN;
      view = QuickGameTableCard;
    } else {
      view = createQuickGame(me.game);
    }
    me.navCtrl.push(view, params).then(() => callback());
  }

  private checkScoresheetOnlyMode() {
    const me = this;
    const timeControl = me.game.time_control;
    if (timeControl === SCORESHEET_ONLY_TIME_CONTROL) {
      me.layoutConfig.swap_sides = true;
    }
  }

  private checkLiveGame() {
    const me = this;
    const game = me.game;
    me.viewConfig = {ping: game.live, tablet: false, battery: true, showLabels: false};
  }

}
