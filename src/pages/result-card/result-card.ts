import {OnDestroy} from "@angular/core";
import {AlertController, ModalController, NavController, NavParams} from "ionic-angular";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {
  BLACK,
  CLASSIC_TIME_CONTROL,
  default as Utils,
  Game,
  LayoutConfig,
  NO_RESULT,
  ON_GOING_GAME,
  PlayerReady,
  QuickGame,
  TournamentGame,
  ViewConfig,
  WHITE
} from "../../utils/utils";
import {Brightness} from '@ionic-native/brightness';
import {TournamentPgnUpload} from "../../providers/tournament/tournamnet-pgn-upload";
import {Insomnia} from "@ionic-native/insomnia";
import {QuickgamePgnUpload} from "../../providers/quicklive/quickgame-pgn-upload";

export class ResultCard implements OnDestroy {

  game: Game & TournamentGame & QuickGame;
  layoutConfig: LayoutConfig;
  showTimeControls: boolean;
  showSendPGN: boolean;
  timeControls;
  requestingGame: boolean;
  destroyComponent: boolean;
  showShareBtns: boolean;

  viewConfig: ViewConfig;
  timerHandles: number[] = [];
  gameResult: string = ON_GOING_GAME;
  showLayoutSetting: boolean;
  whiteStatus: PlayerReady;
  blackStatus: PlayerReady;

  constructor(public insomnia: Insomnia,
              public screenOrientation: ScreenOrientation,
              public pgnService: TournamentPgnUpload | QuickgamePgnUpload,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public modalCtrl: ModalController,
              public navParams: NavParams,
              public brightness: Brightness) {
    const me = this;
    me.timeControls = Utils.mapTimeControls();
    me.showTimeControls = false;
    me.showLayoutSetting = false;
    me.layoutConfig = {swap_sections: false, swap_sides: false};
    me.whiteStatus = {color: WHITE, ready: false};
    me.blackStatus = {color: BLACK, ready: false};
    me.viewConfig = {ping: false, tablet: false, battery: false, showLabels: false};
    me.initialize();
  }

  initialize() {
    const me = this;
    me.lockScreen();
    me.destroyComponent = true;
    me.insomnia.keepAwake();
  }

  ionViewDidLoad() {
    const me = this;
    me.brightness.setBrightness(0.05);
  }

  ngOnDestroy() {
    const me = this;
    if (me.destroyComponent) me.onPageLeave();
    // me.onPageLeave();
  }

  onPageLeave(): void {
    const me = this;
    me.destroyComponent = false;
    me.brightness.setBrightness(-1);
    me.timerHandles.forEach(window.clearInterval);
    me.insomnia.allowSleepAgain();
  }

  hasPendingPgnRequest() {
    const me = this;
    return me.pgnService.hasPendingPgn();
  }

  onSettingsClick() {
    const me = this;
    me.showLayoutSetting = !me.showLayoutSetting;
    me.showSendPGN = false;
  }

  showGameResult() {
    const me = this;
    const result = me.gameResult;
    return result == ON_GOING_GAME ? NO_RESULT : result;
  }

  getTimeControlLabel() {
    const me = this;
    const game = me.game;
    const timeControl = game.time_control || CLASSIC_TIME_CONTROL;
    return me.timeControls[timeControl];
  }

  public get isScoresheetOnlyMode(): boolean {
    const me = this;
    const game = me.game;
    const timeControl = game.time_control;
    return Utils.isScoreSheetOnlyGame(timeControl);
  }

  /////////////////////////////////////// HOOKS
  onTournamentResultClick() {
  }

  onEditGameClick() {
  }

  getTabletName() {
    return '';
  }

  onNavigateTableCardClick() {
  }

  lockScreen() {
    const me = this;
    me.screenOrientation
      .lock(me.screenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY)
      .catch(console.error);
  }

  onShowSendPgnClick() {
    const me = this;
    me.showSendPGN = !me.showSendPGN;
    me.showLayoutSetting = false;
  }

}
