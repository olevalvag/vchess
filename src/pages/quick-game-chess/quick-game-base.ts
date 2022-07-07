import {ChangeDetectorRef, OnDestroy} from '@angular/core';
import {AlertController, Events, ModalController, NavController, NavParams, Platform} from 'ionic-angular';
import {Insomnia} from "@ionic-native/insomnia";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {Brightness} from "@ionic-native/brightness";
import {
  CLASSIC_TIME_CONTROL,
  default as Utils,
  EMPTY_FN,
  ON_GOING_GAME,
  PgnConfig,
  PgnHeaders,
  PgnQuickgameRequestParams,
  PgnStructure,
  QUICK_GAME_TYPE,
  QuickGame,
} from "../../utils/utils";
import {ChessGame} from "../../utils/chess";
import {GameFormTools} from "../../components/game-form-tool/game-form-tools";
import {QuickGamePgnBackup} from "../../providers/quicklive/quick-game-pgn-backup";
import {QuickGameResultCard} from "../result-card/quick-game/quick-game-result-card";
import {QuickGamePage} from "../quick-game-page/quick-game-page";
import {QuickgamePgnUpload} from "../../providers/quicklive/quickgame-pgn-upload";
import {BaseGame} from "../../core/base-game/base-game";

export class QuickGameBase extends BaseGame implements OnDestroy {

  events_subscribed = ['pgn:update', 'chessboard:board_ready', 'chessboard:init_board'];

  constructor(public screenOrientation: ScreenOrientation,
              public insomnia: Insomnia,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public chessGame: ChessGame,
              public events: Events,
              public androidFullScreen: AndroidFullScreen,
              public platform: Platform,
              public brightness: Brightness,
              public pgnUploadService: QuickgamePgnUpload,
              public pgnBackup: QuickGamePgnBackup,
              public navParams: NavParams,
              public cdr: ChangeDetectorRef,
              public ga: GoogleAnalytics) {
    super(screenOrientation, insomnia, modalCtrl, alertCtrl, navCtrl, chessGame, events, androidFullScreen, platform, brightness);
    const me = this;
    me.game_type = QUICK_GAME_TYPE;
    me.viewConfig = navParams.get("viewConfig");
    me.layoutConfig = navParams.get("layoutConfig");
    me.game = navParams.get("game");
    me.game as QuickGame;
    me.initBackup();
    me.initPgnUpload();
    me.initUIConfig(me.game.time_control);
    me.events.subscribe('pgn:update', () => me.refreshGameDataPgn());
    me.events.subscribe('chessboard:board_ready', () => me.checkBoardReady());
  }

  ionViewDidEnter() {
    const me = this;
    Utils.sendViewTagtoGA(me.ga, 'quick_game_page');
    me.events.publish('chessboard:init_board')
  }

  ngOnDestroy(): void {
    const me = this;
    me.events_subscribed.forEach(event => {
      me.events.unsubscribe(event);
    });
  }

  public checkBoardReady() {
    const me = this;
    const game = me.game;
    const result = game.result;
    if (result && result !== ON_GOING_GAME) {
      me.showGameHasResultAlert();
    }
  }

  public onLeavingPage() {
    const me = this;
    me.checkNoResult();

    const params = {
      game: me.game,
      layoutConfig: me.layoutConfig,
      viewConfig: me.viewConfig,
    };
    const game = me.game;
    const result = game.result;
    const pgnStructure = me.buildPgnStructure(result);
    let view = game.cards ? QuickGameResultCard : QuickGamePage;

    me.onPageLeave();
    game['pgn_data'] = me.game_state.pgnString(pgnStructure);
    me.navCtrl.push(view, params).then(() => {
      const index = me.navCtrl.getActive().index;
      me.navCtrl.remove(index - 1, 1);
    });
  }

  public onPlayerInfoClick() {
    const me = this;
    const pgnStructure = me.buildPgnStructure();
    let popup;
    const options = {enableBackdropDismiss: false, cssClass: 'app-modal overwrite_modal_bg'};
    const data = {
      pgn: Utils.pgnString(pgnStructure),
      game: me.game,
      layoutConfig: me.layoutConfig
    };

    popup = me.modalCtrl.create(GameFormTools, data, options);
    popup.onDidDismiss(() => {
      me.pgnBackup.updatePgnData(me.game, me.layoutConfig);
      me.events.publish('chessboard:refresh', {});
      me.closePopup();
    });
    me.openPopup(popup);
  }

  public refreshGameDataPgn(gameResult?: string, success?, error?, forceCard?: boolean) {
    const me = this;
    const game = me.game;
    let successCallback = success || EMPTY_FN;
    let errorCallback = error || EMPTY_FN;

    const pgnStructure = me.buildPgnStructure(gameResult);
    const pgnString = me.game_state.pgnString(pgnStructure);
    const params: PgnQuickgameRequestParams = me.buildPgnRequestParams(pgnString, gameResult);
    me.pgnBackup.savePgn(pgnStructure);

    if (game.live) {
      me.pgnUploadService.sendPgn(params).then(successCallback, errorCallback).catch(errorCallback);
    } else {
      successCallback();
    }
  }

  // Init the game pgn upload service
  public initPgnUpload(): void {
    const me = this;
    const game = me.game;
    me.pgnUploadService.reset();
    if (game.live) {
      me.pgnUploadService.init(game.qlid);
    }
  }

  // Init the game pgn backup service
  public initBackup(): void {
    const me = this;
    me.pgnBackup.initialize(me.game, me.layoutConfig);
  }

  public checkNoResult() {
    const me = this;
    const game = me.game;
    /*if (game.result === ON_GOING_GAME) {
      me.game.result = NO_RESULT;
    }*/
    if (game.live) {
      me.refreshGameDataPgn();
    }
  }

  public buildPgnStructure(gameResult?): PgnStructure {
    const me = this;
    const game = me.game;
    const result = gameResult || me.game_state.result();
    const pgnConfig = {gameResult: result, sloppyNotation: true} as PgnConfig;
    const pgnHeader: PgnHeaders = {
      event: game['event'],
      site: game['site'],
      date: Utils.formatUTCDate(new Date()),
      group: game['group'],
      table: 0,
      round: game.round,
      time_control: game.time_control || CLASSIC_TIME_CONTROL,
      white: game.white_player_name,
      black: game.black_player_name,
      whiteElo: game.white_player_rating,
      blackElo: game.black_player_rating,
      result: result,
      firstMoveRecorded: '',
      lastMoveRecorded: '',
      whiteMoves: me.game_state.white.movesCount,
      blackMoves: me.game_state.black.movesCount,
      currentFEN: me.chessGame.get_fen(),
      whiteClock: '',
      blackClock: '',
      activeClock: me.game_state.clockPaused ? 'Paused' : me.game_state.whiteToMove() ? 'White' : 'Black'
    };
    return me.game_state.buildPgnStructure(pgnHeader, pgnConfig);
  }

  public buildPgnRequestParams(pgn: string, gameResult?): PgnQuickgameRequestParams {
    const me = this;
    const game = me.game;
    const game_status = me.gameStatus(gameResult);
    const w_p_clock = me.game_state.whiteClockTime();
    const b_p_clock = me.game_state.blackClockTime();
    const movesCount = me.game_state.getMovesCount();
    const params: PgnQuickgameRequestParams = {
      tournament_name: game.event,
      tournament_site: game.site,
      group_name: game.group,
      round: game.round,
      table: game.table,
      game_hashtag: game.hashtag,
      white_player_name: game.white_player_name,
      black_player_name: game.black_player_name,
      white_player_fide_id: game.white_player_fide_id,
      black_player_fide_id: game.black_player_fide_id,
      white_player_rating: game.white_player_rating,
      black_player_rating: game.black_player_rating,
      pgn_data: pgn,
      white_player_clock: w_p_clock,
      black_player_clock: b_p_clock,
      game_status: game_status,
      active_clock: me.getActiveClock(),
      number_of_moves: movesCount
    };
    return params;
  }

  public getActiveClock() {
    const me = this;
    if (me.game_state.clockPaused) return 'Paused';
    return me.game_state.whiteToMove() ? 'White' : 'Black';
  }
}
