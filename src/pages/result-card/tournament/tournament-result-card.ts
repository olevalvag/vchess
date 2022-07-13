import {Component, OnDestroy, OnInit} from "@angular/core";
import {default as Utils, TABLE_CARD_ONLY_TIME_CONTROL, TournamentConfig, TournamentGame} from "../../../utils/utils";
import {Brightness} from "@ionic-native/brightness";
import {AlertController, ModalController, NavController, NavParams} from "ionic-angular";
import {TournamentPgnUpload} from "../../../providers/tournament/tournamnet-pgn-upload";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {Insomnia} from "@ionic-native/insomnia";
import {ResultCard} from "../result-card";
import {TournamentProvider} from "../../../providers/tournament/tournament";
import {TournamentTableCard} from "../../table-card/tournament/tournament-table-card";
import {TournamentResults} from "../../../components/tournament-results/tournament-results";
import {Subject} from "rxjs/Subject";
import {takeUntil} from "rxjs/operators";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {createTournamentGame} from "../../../view-factories/tournament-game-factory";
import {TableCardMode} from "../../table-card-mode/table-card-mode";


@Component({
  selector: "tournament-result-card",
  templateUrl: "../result-card.html"
})
export class TournamentResultCard extends ResultCard implements OnInit, OnDestroy {

  protected tournamentConfig: TournamentConfig;
  private subscriptions: Subject<boolean> = new Subject<boolean>();

  constructor(public tournamentProvider: TournamentProvider,
              public insomnia: Insomnia,
              public screenOrientation: ScreenOrientation,
              public pgnService: TournamentPgnUpload,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public modalCtrl: ModalController,
              public navParams: NavParams,
              public brightness: Brightness,
              public ga: GoogleAnalytics) {
    super(insomnia, screenOrientation, pgnService, alertCtrl, navCtrl, modalCtrl, navParams, brightness);
    const me = this;
    me.viewConfig = {ping: true, tablet: true, battery: true, showLabels: false};
    me.tournamentConfig = navParams.get("tournamentConfig");
    me.game = navParams.get("game");
    me.game as TournamentGame;
    me.gameResult = Utils.parseResultFromPgn(me.game['pgn_data']);
  }

  ngOnInit() {
    const me = this;
    // me.resetView();
  }

  ngOnDestroy(): void {
    const me = this;
    // me.resetView();
    super.ngOnDestroy();
  }

  ionViewWillEnter() {
    const me = this;
    me.initView();
    Utils.sendViewTagtoGA(me.ga, 'tournament_result_card_page');
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


  onEditGameClick() {
    const me = this;
    const view = createTournamentGame(me.game);
    const tournamentConfig = me.tournamentConfig;
    const params = {
      game: me.game,
      tournamentConfig: tournamentConfig,
      layoutConfig: me.layoutConfig
    };

    me.resetView();
    me.navCtrl.push(view, params).then(() => {
      const index = me.navCtrl.getActive().index;
      me.navCtrl.remove(index - 1, 1);
    });
  }

  onTournamentResultClick() {
    const me = this;
    const game = me.game;
    const webServerId = game.WebserverID;
    const round = game.round;
    const group_name = game.group_name;
    const params = {webServerId: webServerId, round: round, group_name: group_name};

    let popup = me.modalCtrl.create(TournamentResults, params, {enableBackdropDismiss: true});
    popup.onDidDismiss(() => {
      me.brightness.setBrightness(0.05);
    });
    popup.present().then(() => {
      me.brightness.setBrightness(-1);
    });
  }

  getTabletName() {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    if (tournamentConfig && tournamentConfig.tablet) return tournamentConfig.tablet.tablet_name;
    return '';
  }

  onNavigateTableCardClick() {
    const me = this;
    let prompt = me.alertCtrl.create({
      title: 'Exit Result Table Card',
      message: "Are you sure you want to go to Table Card mode??",
      cssClass: 'app-alert',
      enableBackdropDismiss: true,
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
            me.pgnService.reset();
            me.goToTableCard()
          }
        }
      ]
    });
    prompt.present();

  }

  goToTableCard() {
    const me = this;
    const tournamentConfig = me.tournamentConfig;

    me.resetView();
    me.navCtrl.push(TournamentTableCard, {
      tournamentConfig: tournamentConfig,
      game: me.game
    }, {animate: false}).then(() => {
      const index = me.navCtrl.getActive().index;
      me.navCtrl.remove(index - 1, 1);
    });
  }

  getAssignedGame(): void {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    const key = tournamentConfig.key;
    const pin = tournamentConfig.pin;
    const hasPending = me.hasPendingPgnRequest();

    if (hasPending) {
      me.pgnService.retryPendingPgn();
    } else {
      me.tournamentProvider.getAssignedGame(key, pin)
        .pipe(takeUntil(me.subscriptions))
        .subscribe(game => {
          if (game.outcome === 'error') {
            me.requestingGame = true;
          } else {
            me.requestingGame = false;
            me.checkNewGame(game);
            me.gameResult = Utils.parseResultFromPgn(game['pgn_data']);
          }
        });
    }
  }

  /*checkNewGame(newGame) {
    const me = this;
    const game = me.game;
    const oldGameId = game ? game.game_id : null;
    const newGameId = newGame.game_id;

    if (oldGameId && oldGameId != newGameId) {
      me.game = newGame;
      me.goToTableCard()
    }
  }*/

  checkNewGame(newGame) {
    const me = this;
    const game = me.game;
    if (!game) return;

    if (game.game_id != newGame.game_id) {
      me.game = newGame;
      me.goToTableCard();
    } else if (game.time_control != newGame.time_control) {
      me.game = newGame;
      me.checkTimeControl();
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

}
