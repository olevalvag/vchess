import {OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AlertController, ModalController, Navbar, NavController, NavParams} from "ionic-angular";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {
  BLACK,
  CLASSIC_TIME_CONTROL,
  default as Utils,
  Game,
  LayoutConfig,
  PlayerReady,
  QuickGame,
  TournamentGame,
  ViewConfig,
  WHITE
} from "../../utils/utils";
import {classical__90_30} from "../../core/chess/ClockSettings";
import {Insomnia} from "@ionic-native/insomnia";
import {Brightness} from "@ionic-native/brightness";

export class TableCard implements OnInit, OnDestroy {

  @ViewChild('navbar') navBar: Navbar;

  protected game: Game & TournamentGame & QuickGame;
  protected requestingGame: boolean;
  protected viewConfig: ViewConfig;
  protected destroyComponent: boolean;

  protected timerHandles: number[] = [];
  protected showLayoutSetting: boolean;
  protected whiteStatus: PlayerReady;
  protected blackStatus: PlayerReady;
  protected layoutConfig: LayoutConfig;
  protected showTimeControls: boolean = true;
  protected timeControls;

  constructor(public insomnia: Insomnia,
              public screenOrientation: ScreenOrientation,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public modalCtrl: ModalController,
              public navParams: NavParams,
              public brightness: Brightness) {
    const me = this;
    me.timeControls = Utils.mapTimeControls();
    me.viewConfig = {ping: false, tablet: false, battery: false, showLabels: false};
    me.layoutConfig = {swap_sections: false, swap_sides: false};
    me.whiteStatus = {color: WHITE, ready: false};
    me.blackStatus = {color: BLACK, ready: false};
  }

  ngOnInit(): void {
    const me = this;
  }

  ionViewDidEnter() {
    const me = this;
    me.brightness.setBrightness(0.10);
    me.initialize();
  }

  ngOnDestroy() {
    const me = this;
    if (me.destroyComponent) me.onPageLeave();
    // me.onPageLeave();
  }

  public initialize() {
    const me = this;
    me.destroyComponent = true;
    me.requestingGame = false;
    me.showLayoutSetting = false;
    me.lockScreen();
    me.insomnia.keepAwake();
  }

  public onPageLeave(): void {
    const me = this;
    me.destroyComponent = false;
    me.brightness.setBrightness(-1);
    me.timerHandles.forEach(window.clearInterval);
    me.insomnia.allowSleepAgain();
  }

  public get isScoresheetOnlyMode(): boolean {
    const me = this;
    const game = me.game;
    const timeControl = game.time_control;
    return Utils.isScoreSheetOnlyGame(timeControl);
  }

  public onSettingsClick() {
    const me = this;
    me.showLayoutSetting = !me.showLayoutSetting;
  }

  public onSwitchSidesClick() {
    const me = this;
    me.layoutConfig.swap_sides = !me.layoutConfig.swap_sides;
  }

  public useDefaultClockTemplate() {
    const me = this;
    const game = me.game;
    const hasSettings = me.hasClockTemplate();
    if (!hasSettings) game.clockSettings = classical__90_30;
  }

  public hasClockTemplate() {
    const me = this;
    const game = me.game;
    const clockSettings = game.clockSettings;
    if (clockSettings && clockSettings.stages && clockSettings.stages.length !== 0) return true;
    return false;
  }

  public getTimeControlLabel() {
    const me = this;
    const game = me.game;
    const timeControl = game.time_control || CLASSIC_TIME_CONTROL;
    return me.timeControls[timeControl];
  }

  /////////////////////////////////// HOOKS

  public onPlayerReadyChange() {
  }

  public onSinglePlayerReadyClick() {
  }

  public getTabletName() {
    return '';
  }

  private lockScreen() {
    const me = this;
    me.screenOrientation
      .lock(me.screenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY)
      .catch(console.error);
  }

}
