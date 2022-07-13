import {AfterViewInit, OnDestroy} from '@angular/core';
import {AlertController, Events, ModalController, NavController, NavParams, Platform} from 'ionic-angular';
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {
  CLASSIC_TIME_CONTROL,
  default as Utils,
  EMPTY_FN,
  ON_GOING_GAME,
  PgnConfig,
  PgnHeaders,
  PgnRequestParams,
  PgnStructure,
  TOURNAMENT_GAME_TYPE,
  TournamentConfig,
  TournamentGame,
} from "../../utils/utils";
import {ChessGame} from "../../utils/chess";
import {BaseGame} from "../../core/base-game/base-game";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {TournamentPgnUpload} from "../../providers/tournament/tournamnet-pgn-upload";
import {TournamentPgnBackup} from "../../providers/tournament/tournament-pgn-backup";
import {Insomnia} from "@ionic-native/insomnia";
import {TournamentTableCard} from "../table-card/tournament/tournament-table-card";
import {TournamentResultCard} from "../result-card/tournament/tournament-result-card";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {Brightness} from "@ionic-native/brightness";


export class TournamentGameBase extends BaseGame implements AfterViewInit, OnDestroy {

  showScoresheetOnlyClocks = false;
  protected tournamentConfig: TournamentConfig;
  protected events_subscribed = [
    'pgn:update',
    'chessboard:board_ready',
  ];

  constructor(public screenOrientation: ScreenOrientation,
              public insomnia: Insomnia,
              public pgnService: TournamentPgnUpload,
              public pgnBackup: TournamentPgnBackup,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public navParams: NavParams,
              public navCtrl: NavController,
              public chessGame: ChessGame,
              public events: Events,
              public androidFullScreen: AndroidFullScreen,
              public brightness: Brightness,
              public platform: Platform,
              public ga: GoogleAnalytics) {
    super(screenOrientation, insomnia, modalCtrl,
      alertCtrl, navCtrl, chessGame, events,
      androidFullScreen, platform, brightness);
    const me = this;
    me.game_type = TOURNAMENT_GAME_TYPE;
    me.viewConfig = {ping: true, tablet: true, battery: true, showLabels: false};

    me.layoutConfig = navParams.get("layoutConfig");
    me.tournamentConfig = navParams.get("tournamentConfig");
    me.game = navParams.get("game");
    me.game as TournamentGame;

    me.initBackup();
    me.pgnService.reset();
    me.initUIConfig(me.game.time_control);
    me.events.subscribe('pgn:update', () => me.refreshGameDataPgn());
    me.events.subscribe('chessboard:board_ready', () => me.checkBoardReady());

    // me.game_state = new BaseGameState(me.chessGame, me.game, me.game.clockSettings, me.events);
  }

  // This is a hook function
  protected get approximateClocksValue() {
    return 0;
  }

  ngOnDestroy(): void {
    const me = this;
    me.events_subscribed.forEach(event => {
      me.events.unsubscribe(event);
    });
  }

  ngAfterViewInit() {
    const me = this;
    me.ui_config.buttons.exit = false;
    me.ui_config.buttons.player_info = false;
  }

  ionViewDidEnter() {
    const me = this;
    Utils.sendViewTagtoGA(me.ga, 'tournament_game_page');
    me.events.publish('chessboard:init_board')
  }

  checkBoardReady() {
    const me = this;
    const game = me.game;
    const result = game.result;
    if (result && result !== ON_GOING_GAME) {
      me.showGameHasResultAlert();
    }
  }

  public onLeavingPage() {
    const me = this;
    const game = me.game;
    const result = game.result;
    const params = {tournamentConfig: me.tournamentConfig, game: me.game};
    const pgnStructure = me.buildPgnStructure(result);
    let view = result != ON_GOING_GAME ? TournamentResultCard : TournamentTableCard;

    game['pgn_data'] = me.game_state.pgnString(pgnStructure);
    me.onPageLeave();
    me.navCtrl.push(view, params).then(() => {
      const index = me.navCtrl.getActive().index;
      me.navCtrl.remove(index - 1, 1);
    });
  }

  ////////////// Popups
  public onToolClick(errorMode?) {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    const pin = tournamentConfig.pin;

    let prompt = me.alertCtrl.create({
      title: errorMode ? 'Wrong authorization code!' : 'Password needed.',
      message: 'Enter authorization code to continue.',
      cssClass: `app-alert overwrite_modal_bg ${errorMode && 'wrong_auth_code'}`,
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'code',
          type: 'password',
          placeholder: 'Code'
        },
      ],
      buttons: [
        {
          text: 'No',
          cssClass: 'cancel_btn',
          handler: () => me.closePopup()
        },
        {
          text: 'Yes',
          cssClass: 'ok_btn',
          handler: data => {
            const inputCode = data['code'];
            if (inputCode && inputCode == pin) {
              super.onToolClick();
            } else {
              me.onToolClick(true);
            }
            me.closePopup();
          }
        }
      ]
    });
    me.openPopup(prompt);
  }

  public refreshGameDataPgn(gameResult?: string, success?, error?, forceCard?: boolean) {
    const me = this;
    let successCallback = forceCard ? EMPTY_FN : success || EMPTY_FN;
    let errorCallback = forceCard ? EMPTY_FN : error || EMPTY_FN;

    const pgnStructure = me.buildPgnStructure(gameResult);
    const pgnString = me.game_state.pgnString(pgnStructure);
    const params: PgnRequestParams = me.buildPgnRequestParams(pgnString, gameResult);

    me.pgnBackup.savePgn(pgnStructure);
    me.pgnService.sendPgn(params, true).then(successCallback, errorCallback).catch(errorCallback);
    if (forceCard && success) success();
  }

  ////////////// Utilities
  public getTabletName() {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    if (tournamentConfig && tournamentConfig.tablet) return tournamentConfig.tablet.tablet_name;
    return '';
  }

  protected initBackup(): void {
    const me = this;
    me.pgnBackup.initialize(me.game, me.tournamentConfig, me.layoutConfig);
  }

  ////////////// PGN
  protected buildPgnStructure(gameResult?): PgnStructure {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    const game = me.game;
    const tournament = tournamentConfig.tournament;
    const result = gameResult || me.game_state.result();
    const pgnConfig = {gameResult: result, sloppyNotation: true} as PgnConfig;
    const pgnHeader: PgnHeaders = {
      event: tournament.name,
      site: tournament.site,
      date: tournament.start_date.split('-').join('.'),
      group: game.group_name,
      table: game.table,
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
      activeClock: me.getActiveClock()
    };
    return me.game_state.buildPgnStructure(pgnHeader, pgnConfig);
  }

  protected getActiveClock() {
    const me = this;
    if (me.game_state.clockPaused) return 'Paused';
    return me.game_state.whiteToMove() ? 'White' : 'Black';
  }

  protected buildPgnRequestParams(pgn: string, gameResult?): PgnRequestParams {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    const key = tournamentConfig.key;
    const pin = tournamentConfig.pin;
    const game = me.game;
    const gid = game.game_id;
    const game_status = me.gameStatus(gameResult);
    const w_p_clock = me.game_state.whiteClockTime();
    const b_p_clock = me.game_state.blackClockTime();
    const movesCount = me.game_state.getMovesCount();
    const params: PgnRequestParams = {
      approximate_clocks: me.approximateClocksValue,
      key: key,
      pin: pin,
      gid: gid,
      pgn: pgn,
      game_status: game_status,
      white_clock: w_p_clock,
      black_clock: b_p_clock,
      number_of_moves: movesCount
    };
    return params;
  }
}
