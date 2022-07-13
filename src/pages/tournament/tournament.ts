import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ModalController, NavController, NavParams, Platform} from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Device} from "@ionic-native/device";
import {TournamentProvider} from "../../providers/tournament/tournament";
import {
  default as Utils,
  default_error_msg,
  ON_GOING_GAME,
  PID_PIN,
  TABLE_CARD_ONLY_TIME_CONTROL,
  TournamentConfig
} from "../../utils/utils";

import {
  ABORT_EVENT,
  CHANGE_EVENT,
  CONNECTION_ABORT_STATUS,
  CONNECTION_FAIL_STATUS,
  CONNECTION_PENDING_STATUS,
  CONNECTION_SUCCESS_STATUS,
  ConnectionSteps,
  PID_KEY
} from "../../utils/statics";
import {AppInfo} from "../../components/app-info/app-info";
import {NativeStorage} from '@ionic-native/native-storage';
import {AppVersion} from '@ionic-native/app-version';
import {TournamentTableCard} from "../table-card/tournament/tournament-table-card";
import {TournamentResultCard} from "../result-card/tournament/tournament-result-card";
import {Subject} from "rxjs/Subject";
import {takeUntil} from "rxjs/operators";
import {TableCardMode} from "../table-card-mode/table-card-mode";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {MessagesPopup} from "../../providers/MessagesPopup";
import {Network} from "@ionic-native/network";
import {ConnectionListComponent} from "../../components/tournament-connect/connection-list/connection-list";
import {ScreenOrientation} from "@ionic-native/screen-orientation";

@Component({
  selector: "tournament-page",
  templateUrl: "tournament.html",
  providers: [MessagesPopup]
})
export class TournamentPage implements OnInit, OnDestroy {

  @ViewChild('pinInput') pinInput;
  @ViewChild("connectionList") public connectionList: ConnectionListComponent;
  // TIMERS
  tournamentTimer = null;
  tabletTimer = null;
  gameTimer = null;
  steps: ConnectionSteps = {
    internet: {
      visible: true,
      status: CONNECTION_PENDING_STATUS,
      data: false,
      idx: 0,
      attempt: 0
    },
    tournament: {
      visible: false,
      status: CONNECTION_PENDING_STATUS,
      data: null,
      idx: 0,
      attempt: 0,
      showResponse: false,
      requestResponse: ''
    },
    tablet: {
      visible: false,
      status: CONNECTION_PENDING_STATUS,
      data: null,
      idx: 0,
      attempt: 0,
      showResponse: false,
      requestResponse: ''
    },
    game: {
      visible: false,
      status: CONNECTION_PENDING_STATUS,
      data: null,
      idx: 0,
      attempt: 0,
      showResponse: false,
      requestResponse: ''
    }
  };
  public form: FormGroup;
  public viewPIN: boolean;
  private tournamentConfig: TournamentConfig;
  private subscriptions: Subject<boolean>;
  private pidCode: string;
  private pinCode: string;
  private quickConnect: boolean;

  constructor(public formBuilder: FormBuilder,
              public screenOrientation: ScreenOrientation,
              public platform: Platform,
              public appVersion: AppVersion,
              public modalCtrl: ModalController,
              public messagesPopup: MessagesPopup,
              public device: Device,
              public storage: NativeStorage,
              public tournamentProvider: TournamentProvider,
              public navCtrl: NavController,
              public network: Network,
              public  navParams: NavParams,
              public ga: GoogleAnalytics) {
    const me = this;
    const isMobile = me.platform.is('android') || me.platform.is('cordova');

    me.form = me.formBuilder.group({
      pin: ["", Validators.required]
    });
    me.pidCode = navParams.get("pidCode");
    me.pinCode = navParams.get("pinCode");
    me.quickConnect = navParams.get("quickConnect");

    if (isMobile) {
      me.showInfoModal();
    }
  }

  public ngOnInit() {
    const me = this;
    me.subscriptions = new Subject<boolean>();
  }

  ngOnDestroy(): void {
    const me = this;
    me.resetView();
  }

  ionViewDidEnter() {
    const me = this;
    me.initView();
    Utils.sendViewTagtoGA(me.ga, 'tournament_page');
  }

  ionViewWillLeave(): void {
    const me = this;
    me.resetView();
  }

  //////////////////////////////////////////////////////////////////////////////////// OBSERVERS-----------------------

  private initView() {
    const me = this;
    me.subscriptions = new Subject<boolean>();
    me.lockScreenPortrait();
    me.checkInternetConnection();
    me.focusPinInput();
  }

  private resetView() {
    const me = this;
    if (me.tournamentTimer) window.clearInterval(me.tournamentTimer);
    if (me.tabletTimer) window.clearInterval(me.tabletTimer);
    if (me.gameTimer) window.clearInterval(me.gameTimer);
    me.resetRegisterTablet();
    me.resetGameAssigned();
    me.resetTournamentFetch();
    me.stopObservers();
    me.quickConnect = false;
  }

  private stopObservers() {
    const me = this;
    if (me.subscriptions && !me.subscriptions.isStopped) {
      me.subscriptions.next(true);
      me.subscriptions.unsubscribe();
    }
  }

  //////////////////////////////////////////////////////////////////////////////////// FUNCTIONS   -----------------------

  private lockScreenPortrait() {
    const me = this;
    const orientation = me.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY;
    try {
      me.screenOrientation.lock(orientation).catch(console.error);
    } catch (e) {
      console.log("Look not supported");
    }
  }

  public getTabletKey(): string {
    const me = this;
    return `${me.device.uuid}-${me.device.serial}`;
    // return 'fa674e27b4e90b08-45b7b96f'; //TODO THIS IF FOR WEB TESTING -- 793514
  }

  public isPinInputVisible(): boolean {
    const me = this;
    const {internet, tournament} = me.steps;
    return internet.visible && !tournament.visible;
  }

  public onPinClick(): void {
    const me = this;
    const {tournament} = me.steps;
    tournament.visible = true;
    tournament.status = CONNECTION_PENDING_STATUS;
    me.startTournamentStep();
  }

  /////////////////////////////////////////////// PIN CODE -----------------------

  public getCurrentPin(): string {
    const me = this;

    if (me.pidCode && me.pinCode) return me.pinCode;
    return (me.form.get("pin") || {value: ""}).value;
  }

  public onInternetAbort(): void {
    const me = this;
    me.navCtrl.pop();
  }

  public onPidConnectClick(): void {
    const me = this;
    me.startTournamentStep();
  }

  public onPidConnectAbortClick(): void {
    const me = this;
    me.quickConnect = false;
    me.pinCode = null;
    me.pidCode = null;
    me.form.get('pin').setValue('');
  }

  public onTogglePidVisibility() {
    const me = this;
    me.viewPIN = !me.viewPIN;
  }

  public hasPidCode() {
    const me = this;
    return me.pinCode && me.pidCode;
  }

  /////////////////////////////////////////////// INTERNET CONNECTION -----------------------

  public onTournamentEvent(eventName: string): void {
    const me = this;

    switch (eventName) {
      case ABORT_EVENT: {
        me.resetTournamentFetch();
        me.resetRegisterTablet();
        break;
      }
      case CHANGE_EVENT: {
        this.form.controls['pin'].setValue('');
        me.resetTournamentFetch();
        me.resetRegisterTablet();
        me.resetGameAssigned();
        break;
      }
    }
  }

  public onTabletEvent(eventName: string): void {
    const me = this;
    const {tablet} = me.steps;

    switch (eventName) {
      case ABORT_EVENT: {
        me.resetRegisterTablet();
        tablet.status = CONNECTION_ABORT_STATUS;
        break;
      }
      case CHANGE_EVENT: {
        tablet.visible = true;
        tablet.status = CONNECTION_PENDING_STATUS;
        me.registerTablet();
        break;
      }
    }
  }

  /////////////////////////////////////////////// PID CONNECTION ----------------------------

  protected showContinueCountdown() {
    const me = this;
    const {tournament, tablet, game} = me.steps;
    return game.status != CONNECTION_ABORT_STATUS && tablet.data && tournament.data;
  }

  protected startGameStep(): void {
    const me = this;
    const {tournament, tablet, game} = me.steps;

    if (me.gameTimer) window.clearInterval(me.tabletTimer);
    game.visible = true;
    game.data = null;
    me.tournamentConfig = {
      key: me.getTabletKey(),
      pin: me.getCurrentPin(),
      tournament: tournament.data,
      tablet: tablet.data,
    };
    me.retryGameAssigned();
    me.fetchAssignedGame();
  }

  public onGameEvent(eventName: string): void {
    const me = this;
    const {game} = me.steps;

    switch (eventName) {
      case ABORT_EVENT: {
        me.resetGameAssigned();
        game.status = CONNECTION_ABORT_STATUS;
        break;
      }
      case CHANGE_EVENT: {
        me.resetGameAssigned();
        me.startGameStep();
      }
    }
  }

  private showInfoModal() {
    const me = this;
    let popup = me.modalCtrl.create(AppInfo, {}, {cssClass: '', enableBackdropDismiss: false});
    const showPopup = me.storage.getItem('app:show_tournament_info_version');

    popup.onDidDismiss(data => {
      if (data['cancel']) me.navCtrl.pop();
    });

    showPopup.then(savedVersion => {
      me.appVersion.getVersionCode().then(currentVersion => {
        /*if (savedVersion != currentVersion) {
          popup.present();
        }*/
      })
    }).catch(() => popup.present());
  }

  /////////////////////////////////////////////// TOURNAMENT CONNECTION -----------------------

  private showErrorAlert(message) {
    const me = this;
    me.messagesPopup.showErrorAlert(message);
  }

  private focusPinInput(): void {
    const me = this;
    setTimeout(() => {
      if (me.isPinInputVisible() && me.pinInput) {
        me.pinInput.setFocus(true);
      }
      me.form.get('pin').valueChanges.subscribe(() => {
        me.resetPid();
      });
    }, 500);
  }

  private checkInternetConnection(): void {
    const me = this;
    const {internet} = me.steps;
    const online = navigator.onLine;

    if (online) {
      internet.data = navigator.onLine;
      internet.status = CONNECTION_SUCCESS_STATUS;
      me.checkPidCode();
    } else {
      internet.status = CONNECTION_FAIL_STATUS;
    }

    me.network.onConnect()
      .pipe(takeUntil(me.subscriptions))
      .subscribe(() => {
        internet.data = true;
        internet.status = CONNECTION_SUCCESS_STATUS;
        me.connectionList.uiRrefresh();
        me.checkPidCode();
      });
    me.network.onDisconnect()
      .pipe(takeUntil(me.subscriptions))
      .subscribe(() => {
        internet.data = false;
        internet.status = CONNECTION_FAIL_STATUS;
        me.connectionList.uiRrefresh();
      });
  }

  private checkPidCode() {
    const me = this;
    const pidCode = me.pidCode;
    const pinCode = me.pinCode;

    // if (!pidCode) return;
    if (pidCode && pinCode && me.quickConnect) {
      me.onPidConnectClick();
      return;
    }

    if (pidCode && pinCode && !me.quickConnect) {
      // me.onPidConnectClick();
      // me.form.get('pin').setValue(pinCode, {emitEvent: false});
      return;
    }

    me.storage.getItem(PID_KEY).then(pidCode => {
      if (pidCode) {
        me.pidCode = pidCode;
        me.tournamentProvider.fetchPidCode(pidCode)
          .pipe(takeUntil(me.subscriptions))
          .subscribe((response: PID_PIN) => {
            if (response.outcome == 'success' && response.pin) {
              me.pinCode = response.pin;
              me.form.get('pin').setValue(response.pin, {emitEvent: false});
            } else {
              me.resetPid();
            }
          }, (e) => me.resetPid());
      }
    });
  }

  private resetPid(): void {
    const me = this;
    me.quickConnect = false;
    me.pinCode = null;
    me.pidCode = null;
  }

  private startTournamentStep(): void {
    const me = this;

    if (me.tournamentTimer) window.clearInterval(me.tournamentTimer);
    me.fetchTournament();
    me.retryFetchTournament();
  }

  /////////////////////////////////////////////// REGISTER TABLET -----------------------

  private fetchTournament(): void {
    const me = this;
    const pin = me.getCurrentPin();
    const {tournament} = me.steps;

    me.tournamentProvider.getTournament(pin)
      .pipe(takeUntil(me.subscriptions))
      .timeout(30000)
      .subscribe(
        response => {
          if (response.outcome == 'error') {
            // Tournament has finished or wrong pin
            me.showErrorAlert(response['message']);
            tournament.visible = false;
            if (me.tournamentTimer) window.clearInterval(me.tournamentTimer);
          } else {
            // Tournament data fetch success
            me.resetTournamentFetch();
            me.onTournamentConnectionSuccess(response);
          }
        },
        (response) => {
          // Tournament request fails or timeout
          tournament.status = CONNECTION_FAIL_STATUS;
          tournament.requestResponse = response['message'] || default_error_msg;
        }
      );
  }

  private onTournamentConnectionSuccess(response) {
    const me = this;
    const {tournament, tablet} = me.steps;

    tournament.visible = true;
    tournament.status = CONNECTION_SUCCESS_STATUS;
    tournament.data = response;

    tablet.visible = true;
    tablet.status = CONNECTION_PENDING_STATUS;
    me.startRegisterTabletStep();
  }

  private retryFetchTournament(): void {
    const me = this;
    const {tournament} = me.steps;

    if (me.tournamentTimer) window.clearInterval(me.tournamentTimer);
    me.tournamentTimer = window.setInterval(() => {
      if (tournament.status == CONNECTION_FAIL_STATUS || tournament.status == CONNECTION_PENDING_STATUS) {
        tournament.attempt += 1;
        me.fetchTournament();
      }
    }, 10000)

  }

  private resetTournamentFetch(): void {
    const me = this;
    const {tournament} = me.steps;
    if (me.tournamentTimer) window.clearInterval(me.tournamentTimer);
    tournament.visible = false;
    tournament.status = CONNECTION_PENDING_STATUS;
    tournament.data = null;
    tournament.attempt = 0;
    tournament.showResponse = false;
    tournament.requestResponse = '';
  }

  private startRegisterTabletStep(): void {
    const me = this;

    if (me.tabletTimer) window.clearInterval(me.tabletTimer);
    me.registerTablet();
    me.retryRegisterTablet();
  }

  private registerTablet() {
    const me = this;
    const pin = me.getCurrentPin();
    const tabletKey = me.getTabletKey();
    const {tablet} = me.steps;

    me.tournamentProvider.registerTablet(tabletKey, pin)
      .timeout(30000)
      .pipe(takeUntil(me.subscriptions))
      .subscribe(
        response => {
          if (response.outcome != 'error') {
            me.resetRegisterTablet();
            me.onRegisterTabletSuccess(response);
          }
        }, (response) => {
          tablet.status = CONNECTION_FAIL_STATUS;
          tablet.requestResponse = response['message'] || default_error_msg;
        });
  }

  private onRegisterTabletSuccess(response) {
    const me = this;
    const {tablet} = me.steps;

    tablet.visible = true;
    tablet.status = CONNECTION_SUCCESS_STATUS;
    tablet.data = response;
    me.startGameStep()
  }

  /////////////////////////////////////////////// ASSIGNED GAME -----------------------

  private retryRegisterTablet(): void {
    const me = this;
    const {tablet} = me.steps;

    if (me.tabletTimer) window.clearInterval(me.tabletTimer);
    me.tabletTimer = window.setInterval(() => {
      if (tablet.status == CONNECTION_FAIL_STATUS || tablet.status == CONNECTION_PENDING_STATUS) {
        me.registerTablet();
        tablet.attempt += 1;
      }
    }, 10000)

  }

  private resetRegisterTablet(): void {
    const me = this;
    const {tablet} = me.steps;

    if (me.tabletTimer) window.clearInterval(me.tabletTimer);
    tablet.status = CONNECTION_PENDING_STATUS;
    tablet.data = null;
    tablet.visible = false;
    tablet.attempt = 0;
    tablet.showResponse = false;
    tablet.requestResponse = '';
  }

  private fetchAssignedGame(): void {
    const me = this;
    const {game} = me.steps;
    const key = me.tournamentConfig.key;
    const pin = me.tournamentConfig.pin;

    me.tournamentProvider.getAssignedGame(key, pin)
      .pipe(takeUntil(me.subscriptions))
      .timeout(30000)
      .subscribe(response => {
        if (response.outcome !== 'error') {
          me.resetGameAssigned();
          game.status = CONNECTION_SUCCESS_STATUS;
          game.data = response;
          me.redirectToGameCard(response);
        }
      }, (response) => {
        game.requestResponse = response['message'] || default_error_msg;
        game.status = CONNECTION_FAIL_STATUS;
      });
  }

  private redirectToGameCard(response) {
    const me = this;
    const {game} = me.steps;
    const gameInfo = game.data;
    const pgn_data = response['pgn_data'];
    const gameResult = Utils.parseResultFromPgn(pgn_data);
    const timeControl = response.time_control;

    if (timeControl == TABLE_CARD_ONLY_TIME_CONTROL) {
      me.navCtrl.push(TableCardMode, {game: gameInfo, tournamentConfig: me.tournamentConfig});
    } else {
      if (gameResult != ON_GOING_GAME) {
        me.navCtrl.push(TournamentResultCard, {game: gameInfo, tournamentConfig: me.tournamentConfig});
      } else {
        me.navCtrl.push(TournamentTableCard, {game: gameInfo, tournamentConfig: me.tournamentConfig});
      }
    }
  }

  private retryGameAssigned(): void {
    const me = this;
    const {game} = me.steps;

    if (me.gameTimer) window.clearInterval(me.gameTimer);
    me.gameTimer = window.setInterval(() => {
      if (game.status == CONNECTION_FAIL_STATUS || game.status == CONNECTION_PENDING_STATUS) {
        game.attempt += 1;
        me.fetchAssignedGame();
      }
    }, 5000)

  }

  private resetGameAssigned(): void {
    const me = this;
    const {game} = me.steps;
    if (me.gameTimer) window.clearInterval(me.gameTimer);
    game.visible = false;
    game.status = CONNECTION_PENDING_STATUS;
    game.data = null;
    game.attempt = 0;
    game.showResponse = false;
    game.requestResponse = '';
  }

}
