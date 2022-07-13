import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output,} from "@angular/core";
import {ModalController} from "ionic-angular";
import {
  COMMON_HASHTAGS,
  default as Utils,
  FidePlayerInfo,
  LayoutConfig,
  QuickGame,
  SCORESHEET_ONLY_TIME_CONTROL
} from "../../utils/utils";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ClockTemplates} from "../../components/clock-templates/clock-templates";
import {NativeStorage} from "@ionic-native/native-storage";
import {QuickgameProvider} from "../../providers/quicklive/quicklive";
import {Keyboard} from '@ionic-native/keyboard';
import {Subject} from "rxjs/Subject";
import {takeUntil} from "rxjs/operators";
import {FIDE_LOOKUPS, QUICK_GAME__CLOCK_SETTING, QUICK_GAME__TIME_CONTROL} from "../../utils/statics";


@Component({
  selector: "game-info-form",
  templateUrl: "game-info-form.html"
})
export class GameInfoForm implements OnInit, OnDestroy {

  @Input() createMode: boolean;
  @Input() game: QuickGame;
  @Input() layoutConfig: LayoutConfig;
  @Output() doneClick: EventEmitter<any>;
  @Output() inputScroll: EventEmitter<any>;
  subscriptions: Subject<boolean> = new Subject<boolean>();

  loadingLiveGame: boolean;
  enableFideLookup: boolean = false;
  white_player_fide = false;
  black_player_fide = false;

  form: FormGroup;
  extraOptionsVisible: boolean;
  commonHashtags: Array<string>;
  fidePlayers: Array<FidePlayerInfo>;
  clockTemplates = {};
  timeControls = new Array<any>();

  constructor(public formBuilder: FormBuilder,
              public keyboard: Keyboard,
              public storage: NativeStorage,
              public quickliveProvider: QuickgameProvider,
              public modalCtrl: ModalController) {
    const me = this;
    me.inputScroll = new EventEmitter<any>();
    me.fidePlayers = new Array<FidePlayerInfo>();
    me.loadingLiveGame = false;
    me.commonHashtags = new Array<string>();
    me.doneClick = new EventEmitter<any>();

    me.clockTemplates = Utils.mapClockTemplates();
    me.timeControls = Utils.visualTimeControls();
  }

  @HostListener('click', ['$event', '$event.target'])
  onClick(event: MouseEvent, targetElement: HTMLElement) {
    const me = this;
    let currentCss: DOMTokenList;
    let parentCss: DOMTokenList;
    const targetCss = 'fide_item';

    if (targetElement && targetElement.offsetParent) {
      currentCss = targetElement.classList;
      parentCss = targetElement.offsetParent.classList;
      if (!currentCss.contains(targetCss) || !parentCss.contains(targetCss)) {
        me.white_player_fide = false;
        me.black_player_fide = false;
        me.fidePlayers = [];
      }
    }

  }

  ngOnInit(): void {
    const me = this;
    me.retrieveCommonTags();
    me.storage.getItem(FIDE_LOOKUPS).then(enabled => {
      me.enableFideLookup = enabled;
      me.createForm();
    }).catch(() => me.createForm());
  }

  ngOnDestroy(): void {
    const me = this;
    me.subscriptions.next(true);
    me.subscriptions.unsubscribe();
  }

  scrollInputIntoView(elementId) {
    const me = this;
    let element: any = document.getElementById(elementId);
    let offsetTop = 0;
    do {
      if (!isNaN(element.offsetTop)) {
        offsetTop += element.offsetTop;
      }
    } while (element = element.offsetParent);
    me.inputScroll.emit(offsetTop);
  }

  private createForm() {
    const me = this;
    const game = me.game;

    me.form = me.formBuilder.group({
      clock_template: ['90-30', Validators.required],
      time_control: [game.time_control || SCORESHEET_ONLY_TIME_CONTROL, Validators.required],
      cards: [game.cards || false, Validators.required],
      live: [game.live || false, Validators.required],
      white_player_name: [game.white_player_name || ''],
      black_player_name: [game.black_player_name || ''],
      hashtag: ['', Validators.pattern(/^(?=.*[a-z])[a-z0-9_-]+$/)],
      fide_lookup: [me.enableFideLookup || false],
      event: [game['event'] || ''],
      site: [game['site'] || ''],
      group: [game['group'] || ''],
      round: [game['round'] || ''],
      white_player_rating: [game.white_player_rating || ''],
      black_player_rating: [game.black_player_rating || ''],
      white_player_fide_id: [game.white_player_fide_id || ''],
      black_player_fide_id: [game.black_player_fide_id || ''],
    });

    me.form.valueChanges
      .pipe(takeUntil(me.subscriptions))
      .subscribe(values => {
        for (let key in values) {
          me.game[key] = values[key];
        }
      });

    me.form.get('white_player_name').valueChanges.debounceTime(200)
      .pipe(takeUntil(me.subscriptions))
      .subscribe(value => {
        if (me.enableFideLookup) {
          me.resetWhiteFide();
          me.searchFidePlayer(value);
          me.white_player_fide = true;
        }
      });

    me.form.get('black_player_name').valueChanges.debounceTime(200)
      .pipe(takeUntil(me.subscriptions))
      .subscribe(value => {
        if (me.enableFideLookup) {
          me.resetBlackFide();
          me.searchFidePlayer(value);
          me.black_player_fide = true;
        }
      });

    // Set previous used clock setting
    me.storage.getItem(QUICK_GAME__CLOCK_SETTING).then(lastUsedClock => {
      if (lastUsedClock) {
        me.form.get('clock_template').setValue(lastUsedClock);
        me.game['clockSettings'] = me.clockTemplates[lastUsedClock];
      }
    });

    // Set previous used time control
    me.storage.getItem(QUICK_GAME__TIME_CONTROL).then(lastUsedMode => {
      if (lastUsedMode) {
        me.form.get('time_control').setValue(lastUsedMode);
        me.game['time_control'] = lastUsedMode;
      }
    });
    me.form.get('time_control').valueChanges
      .pipe(takeUntil(me.subscriptions))
      .subscribe(value => me.storage.setItem(QUICK_GAME__TIME_CONTROL, value));
  }

  protected capitalizeNames(key) {
    const me = this;
    const form = me.form;
    if (form) {
      const val = form.get(key).value;
      return Utils.capitalizeWords(val);
    }
    return '';
  }

  protected lowercaseHashtag() {
    const me = this;
    const form = me.form;
    if (form) {
      const val = form.get('hashtag').value || '';
      return val.toLowerCase()
    }
    return '';
  }

  protected isHashtagValid(): boolean {
    const me = this;
    const form = me.form;
    return form.get('hashtag').invalid;
  }

  protected getCurrentHashtag(): string {
    const me = this;
    const form = me.form;
    return form.get('hashtag').value || '';
  }

  protected searchFidePlayer(newValue) {
    const me = this;
    me.quickliveProvider.getFidePlayerInfo(newValue)
      .pipe(takeUntil(me.subscriptions))
      .subscribe(response => {
        me.fidePlayers = response;
      });
  }

  protected onWhiteFidePlayerClick(player: FidePlayerInfo) {
    const me = this;
    const form = me.form;
    me.game['white_player_name'] = player.full_name;
    form.get('white_player_name').patchValue(player.full_name, {emitEvent: false, onlySelf: true});
    form.get('white_player_rating').patchValue(player.rating);
    form.get('white_player_fide_id').patchValue(player.fide_id);
    me.white_player_fide = false;
    me.fidePlayers = [];
  }

  protected onBlackFidePlayerClick(player: FidePlayerInfo) {
    const me = this;
    const form = me.form;
    me.game['black_player_name'] = player.full_name;
    form.get('black_player_name').patchValue(player.full_name, {emitEvent: false, onlySelf: true});
    form.get('black_player_rating').patchValue(player.rating);
    form.get('black_player_fide_id').patchValue(player.fide_id);
    me.black_player_fide = false;
    me.fidePlayers = [];
  }

  protected onLiveChange(): void {
    const me = this;
    const form = me.form;
    const isLive = form.get('live').value;
    if (!isLive) {
      me.loadingLiveGame = false;
      form.get('hashtag').patchValue('');
    } else {
      me.loadingLiveGame = true;
      me.quickliveProvider.getQuickLiveGameId()
        .pipe(takeUntil(me.subscriptions))
        .subscribe(response => {
          me.game.qlid = response.qlid;
          me.loadingLiveGame = false;
        });
    }
  }

  protected onEnableFideChange(): void {
    const me = this;
    const form = me.form;
    const fideLookup = form.get('fide_lookup').value;
    me.enableFideLookup = fideLookup;
    me.storage.setItem(FIDE_LOOKUPS, fideLookup);
  }

  protected isLiveGame(): boolean {
    const me = this;
    const form = me.form;
    if (form) {
      return form.get('live').value;
    }
    return false;
  }

  protected formValid(): boolean {
    const me = this;
    return me.form.valid;
  }

  protected onTagClick(tag: string): void {
    const me = this;
    const form = me.form;
    form.get('hashtag').patchValue(tag);
  }

  protected onExtraOptionsClick(): void {
    const me = this;
    me.extraOptionsVisible = !me.extraOptionsVisible;
  }

  protected onAllGamesClick() {
    let url = "http://app.no";
    window.open(encodeURI(url), '_system', 'location=yes');
  }

  protected onGameHashtagClick() {
    let url = "http://app.no";
    window.open(encodeURI(url), '_system', 'location=yes');
  }

  protected onDirectGameClick() {
    let url = "http://app.no";
    window.open(encodeURI(url), '_system', 'location=yes');
  }

  protected onDoneClick() {
    const me = this;
    me.saveCommonTags();
    me.doneClick.emit();
  }

  public get isScoresheetOnly(): boolean {
    const me = this;
    const timeControl = me.form.get('time_control').value;
    return Utils.isScoreSheetOnlyGame(timeControl);
  }

  //////////////////// ------------------------------------------------------------------- CLOCKS

  protected get getClockTemplatesKeys(): string[] {
    const me = this;
    return Object.keys(me.clockTemplates);
  }

  protected onClockTemplateSelected(selectedKey: string): void {
    const me = this;
    if (selectedKey == 'custom') {
      me.onCustomClockSelected();
      me.storage.remove(QUICK_GAME__CLOCK_SETTING);
    } else {
      me.game['clockSettings'] = me.clockTemplates[selectedKey];
      me.storage.setItem(QUICK_GAME__CLOCK_SETTING, selectedKey);
    }
  }

  private onCustomClockSelected() {
    const me = this;
    let popup = me.modalCtrl.create(ClockTemplates, {customSettings: true}, {enableBackdropDismiss: false});
    popup.present();
    popup.onDidDismiss(data => {
      if (data) {
        me.game['clockSettings'] = data.settings;
        // me.selectedClockSetting = data.name || 'custom';
      }
    });
  }

  //////////////////// ------------------------------------------------------------------- TAGS

  private retrieveCommonTags(): void {
    const me = this;
    const commonTags = me.storage.getItem(COMMON_HASHTAGS);
    commonTags.then(value => {
      let tags = value ? value : '';
      tags = tags.split('|');
      me.commonHashtags = tags;
    });
  }

  private saveCommonTags(): void {
    const me = this;
    const form = me.form;
    const hashtag = form.get('hashtag').value;
    const commonTags = me.commonHashtags;

    if (commonTags.indexOf(hashtag) == -1) {
      if (commonTags.length === 4) commonTags.pop();
      commonTags.unshift(hashtag);
      me.storage.setItem(COMMON_HASHTAGS, commonTags.join('|'));
    }
  }

  private resetWhiteFide() {
    const me = this;
    const form = me.form;
    form.get('white_player_fide_id').patchValue('');
    me.fidePlayers = [];
  }

  private resetBlackFide() {
    const me = this;
    const form = me.form;
    form.get('black_player_fide_id').patchValue('');
    me.fidePlayers = [];
  }

}
