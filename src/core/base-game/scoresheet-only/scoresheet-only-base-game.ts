import {AlertController, Events, ModalController, NavController, Platform} from 'ionic-angular';
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {BLACK, Move, WHITE,} from "../../../utils/utils";
import {ChessGame} from "../../../utils/chess";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {Brightness} from "@ionic-native/brightness";
import {Insomnia} from "@ionic-native/insomnia";
import {BaseGame} from "../base-game";
import {GameHelp} from "../../../components/game-help/game-help";

export class ScoresheetOnlyBaseGame extends BaseGame {

  showScoresheetOnlyClocks = false;

  constructor(public screenOrientation: ScreenOrientation,
              public insomnia: Insomnia,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public chessGame: ChessGame,
              public events: Events,
              public androidFullScreen: AndroidFullScreen,
              public platform: Platform,
              public brightness: Brightness) {
    super(screenOrientation, insomnia, modalCtrl, alertCtrl, navCtrl, chessGame, events, androidFullScreen, platform, brightness);
  }

  public get toolsDisable(): boolean {
    const me = this;
    return false;
  }

  public get registerGameDisable(): boolean {
    const me = this;
    return false;
  }

  // ----------------------------- MOVES ---------------------------------------------

  public get flipBtnDisable(): boolean {
    const me = this;
    return false;
  }

  public get playerInfoDisable(): boolean {
    const me = this;
    return false;
  }

  // ----------------------------- Buttons Utils -------------------------------------

  public startOrStopClock(): void {
    const me = this;
    const allowBtnAction = me.allowActionBtns();
    if (allowBtnAction) {
      me.addElapsedTime();
      me.game_state.startStopClock();
      me.refreshGameDataPgn();
    }
  }

  public pieceDropped(move: Move): void {
    const me = this;
    super.pieceDropped(move);
    me.updateScoresheetGame();
  }

  public updateScoresheetGame() {
    const me = this;
    const turn = me.game_state.colorToMove();
    const movesListHistory = me.game_state.getMoveHistoryList();
    const lastMove = movesListHistory[Math.max(movesListHistory.length - 1, 0)];

    if (movesListHistory.length == 0 || (lastMove && lastMove.isValidMove)) {
      if (turn === WHITE) me.whiteClockPressed();
      if (turn === BLACK) me.blackClockPressed();
    } else if (lastMove && lastMove.isDashMove) {
      me.game_state.replaceDashToMove(turn);
    }
  }

  public initScoresheetOnlyGame() {
    const me = this;

    me.startOrStopClock();
    me.game_state.clockPaused = false;
    me.updateScoresheetGame();


    const config = me.brightnessConfig[0];
    me.brightnessIdx = 0;
    me.brightness.setBrightness(config.normal);
    me.onBrightnessUpdate();
  }

  // ----------------------------- Games Modes ---------------------------------------------

  public openPopup(popup) {
    const me = this;
    me.startOrStopClock();
    setTimeout(() => popup.present(), 100);
  }

  public closePopup() {
    const me = this;
    me.initScoresheetOnlyGame();
  }

  // ----------------------------- Utilities ---------------------------------------------

  public alertPopupCss() {
    const me = this;
    let cssClass = 'app-alert ';
    return cssClass;
  }

  public swipeEvent(event: any): void {
    const me = this;
    const backMoveList = me.game_state.backMoveList;

    event.preventDefault();
    if (backMoveList.length == 0) {
      if (me.game_state.whiteToMove()) {
        me.game_state.addWhiteDashMove();
        me.addElapsedTime();
      } else if (me.game_state.blackToMove()) {
        me.game_state.addBlackDashMove();
        me.addElapsedTime();
      }
    }
  }

  public addElapsedTime(): void {
    const me = this;
    const turn = me.game_state.colorToMove();

    if (me.timestamp !== undefined) {
      const now = Date.now();
      const elapsed = (now - me.timestamp) / 1000;
      me.timestamp = now;
      me.game_state.addElapsedTime(elapsed, turn);
    }
  }

  public onShowHiddenClocks() {
    const me = this;
    me.showScoresheetOnlyClocks = !me.showScoresheetOnlyClocks;
  }

  public showHelpPopup() {
    const me = this;
    let popup = me.modalCtrl.create(GameHelp, {}, {enableBackdropDismiss: true});
    popup.present();
  }

  // ----------------------------- DASH ---------------------------------------------

  public overwriteMove(move: Move, singleMove?: boolean) {
    const me = this;
    me.game_state.overwriteMove(move);
  }

}
