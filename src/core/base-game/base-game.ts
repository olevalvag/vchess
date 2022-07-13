import {AlertController, Events, ModalController, NavController, Platform} from 'ionic-angular';
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import _ from 'underscore'
import {
  BrightnessConfig,
  default as Utils,
  EMPTY_FN,
  Game,
  LayoutConfig,
  Move,
  ON_GOING_GAME,
  QUICK_GAME_TYPE,
  QuickGame,
  TOURNAMENT_GAME_TYPE,
  TournamentGame,
  ViewConfig
} from "../../utils/utils";
import {ChessGame} from "../../utils/chess";
import {Tools} from "../../components/tools/tools";
import {RegisterGame} from "../../components/register-game/register-game";
import {BaseGameState} from "../chess/game-state/base-game-state";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {Brightness} from "@ionic-native/brightness";
import {Insomnia} from "@ionic-native/insomnia";
import {UI_CONFIG, UI_CONFIG_OPT} from "../../utils/config";
import {ScoresheetGameState} from "../chess/game-state/scoresheet-game-state";

export class BaseGame {

  public game_type: String = QUICK_GAME_TYPE;
  public game_state: BaseGameState & ScoresheetGameState;
  public game: Game & QuickGame & TournamentGame;

  public ui_config: UI_CONFIG_OPT;
  public viewConfig: ViewConfig;
  public layoutConfig: LayoutConfig;

  public timerHandles: number[] = [];
  public timestamp: number | undefined;
  public unregisterBackButtonAction: any;
  public isRecoveryMode: boolean = false;

  // Brightness
  public brightnessTimer: any;
  public brightnessIdx: number = 0;
  public brightnessConfig: Array<BrightnessConfig> = [
    {
      delay: 8,
      normal: 0.2,
      saving: 0.1
    },
    {
      delay: 8,
      normal: 0.4,
      saving: 0.1
    },
  ];

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
    const me = this;
    me.initialize();
  }

  public initialize() {
    const me = this;
    me.chessGame.reset();
    me.layoutConfig = {swap_sections: false, swap_sides: false};
    me.viewConfig = {ping: false, tablet: false, battery: false, showLabels: false};
    me.lockScreenPortrait();
    me.androidFullScreen.isImmersiveModeSupported()
      .then(() => me.androidFullScreen.immersiveMode())
      .catch((error: any) => console.log(error));
    me.unregisterBackButtonAction = me.platform.registerBackButtonAction(function (event) {}, 101);
    me.insomnia.keepAwake();
    me.stopBrightness();
  }

  public ionViewDidLoad() {
    const me = this;
    me.addKeyListeners();
  }

  public ngOnInit(): void {
    const me = this;
    me.timestamp = Date.now();
    me.timerHandles.push(window.setInterval(() => me.addElapsedTime(), 501));
  }

  public onPageLeave(): void {
    const me = this;
    me.timerHandles.forEach(window.clearInterval);
    me.insomnia.allowSleepAgain();
    me.stopBrightness();
  }

  ionViewWillLeave() {
    const me = this;
    // Unregister the custom back button action for this page
    me.unregisterBackButtonAction && me.unregisterBackButtonAction();
  }

  public initUIConfig(timeControl) {
    const me = this;
    const defaultConfig = UI_CONFIG['Classic'] as UI_CONFIG_OPT;

    if (timeControl && UI_CONFIG.hasOwnProperty(timeControl)) {
      me.ui_config = UI_CONFIG[timeControl] as UI_CONFIG_OPT;
    } else {
      me.ui_config = defaultConfig;
    }
  }

  public get clockIconName(): string {
    const me = this;
    return me.game_state.clockPaused ? "play" : "pause";
  }

  public get toolsDisable(): boolean {
    const me = this;
    return !me.game_state.clockPaused;
  }

  public get registerGameDisable(): boolean {
    const me = this;
    return !me.game_state.clockPaused;
  }

  public get flipBtnDisable(): boolean {
    const me = this;
    return !me.game_state.clockPaused;
  }

  public get forwardDisable(): boolean {
    const me = this;
    let backMoveList = me.game_state.backMoveList;
    return backMoveList.length == 0;
  }

  public get backDisable(): boolean {
    const me = this;
    const chessHistory = me.chessGame.game_moves_history();
    return chessHistory.length <= 0;
  }

  public get playerInfoDisable(): boolean {
    const me = this;
    return !me.game_state.clockPaused;
  }

  public startOrStopClock(): void {
    const me = this;
    const allowBtnAction = me.allowActionBtns();
    if (allowBtnAction) {
      me.addElapsedTime();
      me.game_state.startStopClock();
      me.refreshGameDataPgn();
    } else {
      me.showGameHasResultAlert();
    }
  }

  public onExitClick(callback?): void {
    const me = this;
    let cssClass = me.alertPopupCss();

    let prompt = me.alertCtrl.create({
      title: 'Exit current game',
      message: "Are you sure you want to exit?",
      cssClass: cssClass,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'No',
          cssClass: 'cancel_btn',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          cssClass: 'ok_btn',
          handler: () => {
            if (callback) {
              callback();
            } else {
              me.onLeavingPage();
            }
          }
        }
      ]
    });
    prompt.present();
  }

  public whiteClockPressed(): void {
    const me = this;
    const blitzMode = me.isBlitzMode();

    me.game_state.addWhiteMove();
    me.addElapsedTime();
    if (blitzMode) {
      me.refreshGameDataPgn();
    }
  }

  public blackClockPressed(): void {
    const me = this;
    const blitzMode = me.isBlitzMode();

    me.game_state.addBlackMove();
    me.addElapsedTime();
    if (blitzMode) {
      me.refreshGameDataPgn();
    }
  }

  // ----------------------------- POPUPS ---------------------------------------------
  public onToolClick(errorMode?) {
    const me = this;
    let movesListHistory = me.game_state.getMoveHistoryList();
    let layoutConfig = me.layoutConfig;
    let white = me.game_state.white;
    let black = me.game_state.black;
    const popupConfig = {enableBackdropDismiss: false, cssClass: 'app-modal overwrite_modal_bg'};
    const toolData = {
      white: white,
      black: black,
      showExit: true,
      movesListHistory: movesListHistory,
      layoutConfig: layoutConfig,
      ui_config: me.ui_config
    };
    let popup = me.modalCtrl.create(Tools, toolData, popupConfig);

    popup.onDidDismiss((response) => {
      me.events.publish('score_sheet:refresh', movesListHistory);
      me.events.publish('chessboard:refresh', {});
      me.closePopup();
      if (response && response.exitGame) me.onExitClick(() => me.onLeavingPage());

    });
    me.openPopup(popup);
  }

  public onRegisterGameClick() {
    const me = this;
    const game = me.game;
    const opts = {
      enableBackdropDismiss: false,
      cssClass: 'app-modal overwrite_modal_bg'
    };
    const data = {gameResult: game.result || ON_GOING_GAME};
    let popup;

    popup = me.modalCtrl.create(RegisterGame, data, opts);
    popup.onDidDismiss((response) => {

      if (response) {
        me.registerGameResult(response);
      }
      me.closePopup();

    });
    me.openPopup(popup);
  }

  public showGameHasResultAlert(): void {
    const me = this;
    const game = me.game;
    const result = game.result;
    let cssClass = me.alertPopupCss();
    let alert = me.alertCtrl.create({
      title: 'Game has a result.',
      message: 'Remove game result before attempting to edit moves.',
      cssClass: cssClass,
      enableBackdropDismiss: true,
      buttons: [
        {
          text: 'Ok',
          cssClass: 'ok_btn',
          handler: () => {
          }
        }
      ]
    });

    if (result && result != ON_GOING_GAME) {
      alert.present();
    }
  }

  // ----------------------------- MOVES ---------------------------------------------
  public pieceDropped(move: Move): void {
    const me = this;
    const backMoveList = me.game_state.backMoveList;
    const clockPaused = me.game_state.clockPaused;
    const backListCount = backMoveList.length;

    if (clockPaused) {
      me.overwriteMove(move, true);
    } else {
      if (backListCount > 0) {
        me.overwriteMove(move, false);
      } else {
        me.game_state.recordMove(move);
      }
    }
  }

  public backMove(): void {
    const me = this;
    const allowBtnAction = me.allowActionBtns();
    if (allowBtnAction) {
      const backMove = me.game_state.undoMove();
      if (backMove) {
        me.events.publish('chessboard:back_move');
      }
    } else {
      me.showGameHasResultAlert();
    }
  }

  public forwardMove(): void {
    const me = this;
    const allowBtnAction = me.allowActionBtns();
    if (allowBtnAction) {
      me.game_state.forwardMove();
      me.events.publish('chessboard:forward_move');
    } else {
      me.showGameHasResultAlert();
    }
  }

  // ----------------------------- HOOKS ---------------------------------------------
  public refreshGameDataPgn(gameResult?: string, success?, error?, forceCard?: boolean) {
  }

  public onLeavingPage() {
  }

  // public showHelpPopup() {}

  // ----------------------------- BRIGHTNESS ---------------------------------------------

  public getTabletName() {
    return '';
  }

  public onBrightnessUpdate() {
    const me = this;
    const game = me.game;
    const idx = me.brightnessIdx;
    let config = me.brightnessConfig[idx];

    if (!Utils.isScoreSheetOnlyGame(game.time_control)) {
      me.brightness.setBrightness(-1);
      return;
    }
    if (!config) return;

    if (me.brightnessTimer) {
      window.clearInterval(me.brightnessTimer);
      me.brightness.setBrightness(config.normal);
    }

    me.brightnessTimer = window.setTimeout(() => {
      me.brightness.setBrightness(config.saving);
    }, config.delay * 1000);
  }

  public onBrightnessClick() {
    const me = this;

    if (me.brightnessIdx != -1) {
      const idx = (me.brightnessIdx + 1) % 2;
      const config = me.brightnessConfig[idx];
      me.brightnessIdx = idx;
      me.brightness.setBrightness(config.normal);
      me.onBrightnessUpdate();
    } else {
      me.brightness.setBrightness(-1);
      window.clearInterval(me.brightnessTimer);
    }
  }

  public getBrightnessBtnColor() {
    const me = this;
    const idx = me.brightnessIdx;
    if (idx == -1) return 'dark';

    if (idx == 0) return 'primary';
    if (idx == 1) return 'third';
    return 'dark';
  }

  public stopBrightness(): void {
    const me = this;
    if (me.brightnessTimer) window.clearInterval(me.brightnessTimer);
    me.brightness.setBrightness(-1);
  }

  // ----------------------------- Buttons Utils ---------------------------------------------

  public onOffBrightness() {
    const me = this;
    if (me.brightnessIdx == -1) {
      me.brightnessIdx = 0;
      me.onBrightnessUpdate();
    } else {
      window.clearInterval(me.brightnessTimer);
      me.brightnessIdx = -1;
      me.brightness.setBrightness(-1);
    }
  }

  public allowActionBtns() {
    const me = this;
    let game = me.game;
    const result = game.result;
    if (result && result != ON_GOING_GAME) {
      return false;
    }
    return true;
  }

  public isBlitzMode(): boolean {
    const me = this;
    const game = me.game;
    if (!game) return false;
    const timeControl = game.time_control;
    return Utils.isBlitzGame(timeControl);
  }

  public onFlipGameClick() {
    const me = this;
    const layoutConfig = me.layoutConfig;
    me.layoutConfig.swap_sides = !layoutConfig.swap_sides;
    me.events.publish('chessboard:refresh', {});
  }

  public openPopup(popup) {
    const me = this;
    me.lockScreenLandscape();
    setTimeout(() => popup.present(), 100);
  }

  public closePopup() {
    const me = this;
    me.lockScreenPortrait();
  }

  public alertPopupCss() {
    const me = this;
    const layoutConfig = me.layoutConfig;
    let cssClass = 'app-alert ';
    cssClass += layoutConfig.swap_sections ? 'overwrite-alert-fliped' : 'overwrite-alert';
    return cssClass;
  }

  public get isTopMenuVisible(): boolean {
      const me = this;
      const topMenuConfig = me.ui_config.top_menu;
      return topMenuConfig.logo || _.some(topMenuConfig.menu, x => x == true);
  }

  // ----------------------------- Games Modes ---------------------------------------------

  public registerGameResult(data) {
    const me = this;
    let game = me.game;
    // const oldResult = game.result;
    const newResult = data['gameResult'];
    game.result = newResult;

    if (newResult != ON_GOING_GAME) {
      if (me.game_type == TOURNAMENT_GAME_TYPE) {
        me.refreshGameDataPgn(newResult, () => me.onLeavingPage(), EMPTY_FN, true);
      } else {
        me.refreshGameDataPgn(newResult, () => me.onLeavingPage(), EMPTY_FN);
      }
    }
  }

  public addKeyListeners() {
    const me = this;
    document.addEventListener('keydown', (keyData) => {
      const clockPaused = me.game_state.clockPaused;
      const key = keyData.key;
      const whiteRunning = me.game_state.whiteToMove();
      const blackRunning = me.game_state.blackToMove();
      if (clockPaused) return;
      if (key == 'w' && whiteRunning) me.whiteClockPressed();
      if (key == 'b' && blackRunning) me.blackClockPressed();
    });
  }

  // ----------------------------- Utilities ---------------------------------------------

  public lockScreenLandscape() {
    const me = this;
    const orientation = me.layoutConfig.swap_sections ?
      me.screenOrientation.ORIENTATIONS.LANDSCAPE_SECONDARY :
      me.screenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY;
    try {
      me.screenOrientation.lock(orientation).catch(console.error);
    } catch (e) {
      console.log("Look not supported");
    }
  }

  public lockScreenPortrait() {
    const me = this;
    const orientation = me.layoutConfig.swap_sections ?
      me.screenOrientation.ORIENTATIONS.PORTRAIT_SECONDARY :
      me.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY;
    try {
      me.screenOrientation.lock(orientation).catch(console.error);
    } catch (e) {
      console.log("Look not supported");
    }
  }

  public addElapsedTime(): void {
    const me = this;

    if (me.timestamp !== undefined) {
      const now = Date.now();
      const elapsed = (now - me.timestamp) / 1000;
      me.timestamp = now;
      me.game_state.addElapsedTime(elapsed);
    }
  }

  public overwriteMove(move: Move, singleMove?: boolean) {
    const me = this;
    me.game_state.overwriteMove(move, singleMove);
  }

  // ----------------------------- PGN ---------------------------------------------

  public gameStatus(gameResult) {
    const me = this;
    let result = gameResult || me.game_state.result();
    if (result != ON_GOING_GAME) return result;
    return me.game_state.clockPaused ? 'Paused' : 'Live';
  }

}
