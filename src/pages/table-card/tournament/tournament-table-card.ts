import {Component, OnDestroy} from "@angular/core";
import {AlertController, ModalController, NavController, NavParams} from "ionic-angular";
import {TournamentProvider} from "../../../providers/tournament/tournament";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {
  default as Utils,
  ON_GOING_GAME,
  TABLE_CARD_ONLY_TIME_CONTROL,
  TournamentConfig,
  TournamentGame
} from "../../../utils/utils";
import {TournamentResults} from "../../../components/tournament-results/tournament-results";
import {Insomnia} from "@ionic-native/insomnia";
import {TableCard} from "../table-card";
import {TournamentResultCard} from "../../result-card/tournament/tournament-result-card";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs/Subject";
import {TableCardMode} from "../../table-card-mode/table-card-mode";
import {parseClockSettings} from "../../../core/chess/ClockSettings";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {Brightness} from "@ionic-native/brightness";
import {createTournamentGame} from "../../../view-factories/tournament-game-factory";

@Component({
  selector: "tournament-table-card",
  templateUrl: "../table-card.html"
})
export class TournamentTableCard extends TableCard implements OnDestroy {

  protected tournamentConfig: TournamentConfig;
  protected subscriptions: Subject<boolean>;

  constructor(public tournamentProvider: TournamentProvider,
              public insomnia: Insomnia,
              public screenOrientation: ScreenOrientation,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public modalCtrl: ModalController,
              public navParams: NavParams,
              public ga: GoogleAnalytics,
              public brightness: Brightness) {
    super(insomnia, screenOrientation, alertCtrl, navCtrl, modalCtrl, navParams, brightness);
    const me = this;
    me.viewConfig = {ping: true, tablet: true, battery: true, showLabels: true};
    me.tournamentConfig = navParams.get("tournamentConfig");
    me.game = navParams.get("game");
    me.game as TournamentGame;
  }

  ngOnDestroy(): void {
    const me = this;
    // me.resetView();
    super.ngOnDestroy();
  }

  ionViewWillEnter() {
    const me = this;
    me.initView();
    Utils.sendViewTagtoGA(me.ga, 'tournament_table_card_page');
  }

  ionViewWillLeave(): void {
    const me = this;
    // me.resetView();
  }

  private initView() {
    const me = this;
    me.subscriptions = new Subject<boolean>();
    me.timerHandles.push(window.setInterval(() => me.getAssignedGame(), 10000));
  }

  private resetView() {
    const me = this;
    me.onPageLeave();
    me.stopObservers();
  }

  private stopObservers() {
    const me = this;
    if (me.subscriptions && !me.subscriptions.isStopped) {
      me.subscriptions.next(true);
      me.subscriptions.unsubscribe();
    }
  }

  //////////////////////////////////////////////////////////////////////////////////// FUNCTIONS  -----------------------

  public getTabletName(): string {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    if (tournamentConfig && tournamentConfig.tablet) return tournamentConfig.tablet.tablet_name;
    return '';
  }

  public onPlayerReadyChange() {
    const me = this;
    const view = createTournamentGame(me.game);
    const whiteReady = me.whiteStatus;
    const blackReady = me.blackStatus;
    const params = {
      game: me.game,
      tournamentConfig: me.tournamentConfig,
      layoutConfig: me.layoutConfig
    };

    if (whiteReady.ready && blackReady.ready) {
      me.useDefaultClockTemplate();

      me.resetView();
      me.navCtrl.push(view, params).then(() => {
        const index = me.navCtrl.getActive().index;
        me.navCtrl.remove(index - 1, 1);
      });
    }
  }

  public checkClockTemplate(newGame) {
    const me = this;
    const game = me.game;
    const key = 'clock_template_details';
    const exist = newGame[key] && game[key];
    if (exist && (game[key] !== newGame[key])) {
      game.clockSettings = parseClockSettings(newGame.clock_template_details);
    }
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

  public onSinglePlayerReadyClick() {
    const me = this;
    const view = createTournamentGame(me.game);
    const params = {
      game: me.game,
      tournamentConfig: me.tournamentConfig,
      layoutConfig: me.layoutConfig
    };
    me.useDefaultClockTemplate();

    me.resetView();
    me.navCtrl.push(view, params).then(() => {
      const index = me.navCtrl.getActive().index;
      me.navCtrl.remove(index - 1, 1);
    });
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
      me.checkNewGameResult();
    } else if (game.game_id && newGame.game_id) {
      me.checkClockTemplate(newGame);
    }
  }

  private checkTimeControl() {
    const me = this;
    const game = me.game;
    const timeControl = game.time_control;
    const params = {game: me.game, tournamentConfig: me.tournamentConfig};
    if (timeControl == TABLE_CARD_ONLY_TIME_CONTROL) {

      me.resetView();
      me.navCtrl.push(TableCardMode, params).then(() => {
        const index = me.navCtrl.getActive().index;
        me.navCtrl.remove(index - 1, 1);
      });
    }
  }

  private checkNewGameResult() {
    const me = this;
    const game = me.game;
    const gameResult = Utils.parseResultFromPgn(game['pgn_data']);
    const params = {game: me.game, tournamentConfig: me.tournamentConfig};
    if (gameResult != ON_GOING_GAME) {

      me.resetView();
      me.navCtrl.push(TournamentResultCard, params).then(() => {
        const index = me.navCtrl.getActive().index;
        me.navCtrl.remove(index - 1, 1);
      });
    }
  }

}
