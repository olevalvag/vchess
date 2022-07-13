import {Component, OnDestroy, OnInit} from "@angular/core";
import {
  BLACK,
  BLACK_WON,
  default as Utils,
  DRAW_GAME,
  LayoutConfig,
  ON_GOING_GAME,
  PgnRequestParams,
  PlayerReady,
  TABLE_CARD_ONLY_TIME_CONTROL,
  TournamentConfig,
  TournamentGame,
  ViewConfig,
  WHITE,
  WHITE_WON
} from "../../utils/utils";
import {Insomnia} from "@ionic-native/insomnia";
import {AlertController, ModalController, NavController, NavParams} from "ionic-angular";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {TournamentResults} from "../../components/tournament-results/tournament-results";
import {takeUntil} from "rxjs/operators";
import {TournamentProvider} from "../../providers/tournament/tournament";
import {Subject} from "rxjs/Subject";
import {TournamentResultCard} from "../result-card/tournament/tournament-result-card";
import {TournamentTableCard} from "../table-card/tournament/tournament-table-card";
import {GoogleAnalytics} from '@ionic-native/google-analytics';

@Component({
  selector: "table-card-mode",
  templateUrl: "table-card-mode.html"
})
export class TableCardMode implements OnInit, OnDestroy {

  protected game: TournamentGame;
  protected tournamentConfig: TournamentConfig;
  protected requestingGame: boolean;
  protected viewConfig: ViewConfig;
  protected whiteStatus: PlayerReady;
  protected blackStatus: PlayerReady;
  protected timerHandles: number[] = [];
  protected layoutConfig: LayoutConfig;
  private gameResult = ON_GOING_GAME;
  private subscriptions: Subject<boolean> = new Subject<boolean>();

  constructor(public insomnia: Insomnia,
              public tournamentProvider: TournamentProvider,
              public screenOrientation: ScreenOrientation,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public modalCtrl: ModalController,
              public navParams: NavParams,
              public ga: GoogleAnalytics) {
    const me = this;
    me.whiteStatus = {color: WHITE, ready: false};
    me.blackStatus = {color: BLACK, ready: false};
    me.layoutConfig = {swap_sections: false, swap_sides: false};
    me.viewConfig = {ping: true, tablet: true, battery: true, showLabels: true};
    me.tournamentConfig = navParams.get("tournamentConfig");
    me.game = navParams.get("game");
  }


  ngOnInit() {
    const me = this;
    me.initialize();
  }

  ionViewWillEnter() {
    const me = this;
    me.timerHandles.push(window.setInterval(() => me.getAssignedGame(), 5000));
    Utils.sendViewTagtoGA(me.ga, 'table_card_mode_page');
  }

  ngOnDestroy() {
    const me = this;
    me.subscriptions.next(true);
    me.subscriptions.unsubscribe();
  }

  public initialize() {
    const me = this;
    me.requestingGame = false;
    me.lockScreen();
    me.insomnia.keepAwake();
  }

  onPageLeave(): void {
    const me = this;
    me.timerHandles.forEach(window.clearInterval);
    me.insomnia.allowSleepAgain();
  }

  public onTournamentResultClick() {
    const me = this;
    const game = me.game;
    const webServerId = game.WebserverID;
    const round = game.round;
    const group_name = game.group_name;
    const params = {webServerId: webServerId, round: round, group_name: group_name};
    let popup = me.modalCtrl.create(TournamentResults, params, {enableBackdropDismiss: true});
    popup.present();
  }

  public getTabletName(): string {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    if (tournamentConfig && tournamentConfig.tablet) return tournamentConfig.tablet.tablet_name;
    return '';
  }

  isSelectedBtn(result: string) {
    const me = this;
    let selected = me.parseSelectedResult(result);
    return me.gameResult == selected;
  }

  onResultClick(result: string) {
    const me = this;
    me.gameResult = me.parseSelectedResult(result);
    me.updateGameResult();
  }

  onRemoveResult() {
    const me = this;
    me.gameResult = ON_GOING_GAME;
    me.updateGameResult();
  }

  private lockScreen() {
    const me = this;
    me.screenOrientation
      .lock(me.screenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY)
      .catch(console.error);
  }

  private getAssignedGame(): void {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    const key = tournamentConfig.key;
    const pin = tournamentConfig.pin;
    me.tournamentProvider.getAssignedGame(key, pin)
      .pipe(takeUntil(me.subscriptions))
      .subscribe(game => {
        if (game.outcome === 'error') {
          me.requestingGame = true;
        } else {
          me.requestingGame = false;
          me.checkNewGame(game)
        }
      });
  }

  private checkNewGame(newGame) {
    const me = this;
    const game = me.game;
    if (!game) return;
    const hasNewId = game.game_id != newGame.game_id;

    if (hasNewId ||
      game.time_control != newGame.time_control ||
      game.white_player_name != newGame.white_player_name ||
      game.black_player_name != newGame.black_player_name) {
      me.game = newGame;
      me.checkTimeControl();
      me.gameResult = hasNewId ? ON_GOING_GAME : me.gameResult;
    }
  }

  private checkTimeControl() {
    const me = this;
    const game = me.game;
    const timeControl = game.time_control;
    const gameResult = Utils.parseResultFromPgn(game.result) || ON_GOING_GAME;
    const params = {game: me.game, tournamentConfig: me.tournamentConfig};
    let redirectPage;

    if (timeControl != TABLE_CARD_ONLY_TIME_CONTROL) {
      redirectPage = gameResult != ON_GOING_GAME ? TournamentResultCard : TournamentTableCard;
      me.onPageLeave();
      me.navCtrl.push(redirectPage, params).then(() => {
        const index = me.navCtrl.getActive().index;
        me.navCtrl.remove(index - 1, 1);
      });
    }
  }

  ///////////////////////////////////////////////////// Result section
  private parseSelectedResult(result: string) {
    let selected = ON_GOING_GAME;
    if (result == 'white') {
      selected = WHITE_WON;
    } else if (result == 'black') {
      selected = BLACK_WON;
    } else if (result == 'draw') {
      selected = DRAW_GAME;
    }
    return selected;
  }

  private updateGameResult() {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    const pin = tournamentConfig.pin;
    const params: PgnRequestParams = {
      pin: pin,
      gid: me.game.game_id,
      game_status: me.gameResult,
      number_of_moves: 0
    };
    me.tournamentProvider.updateGameData(params).subscribe(() => {
    });
  }

}
