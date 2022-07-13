import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from "@angular/core";
import {Events} from 'ionic-angular';
import {Vibration} from "@ionic-native/vibration";
import {ClockState} from "../../core/chess/ClockState";
import {AudioPlayer} from "../../providers/audio-player";
import Utils, {BLACK, WHITE} from '../../utils/utils'

@Component({
  selector: "clock",
  templateUrl: "clock.html",
  providers: [AudioPlayer],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClockComponent implements OnDestroy {

  @Input() public color: string;
  @Input() public state: ClockState;
  @Input() public playerName: string;
  @Input() public toMove: boolean;
  @Input() public paused: boolean;
  @Input() public timeControl: string;
  @Input() public hasEmptyMoves: boolean = false;
  @Output() public clockPressed = new EventEmitter();
  private missingMoves: boolean = false;
  private events_subscribed = [
    'clocks:update_missing_moves'
  ];

  constructor(public vibration: Vibration,
              public cdr: ChangeDetectorRef,
              public events: Events,
              public audioPlayer: AudioPlayer) {
    const me = this;
    audioPlayer.preload('clockHit', 'assets/audio/chop_sound.mp3');
    me.events.subscribe('clocks:update_missing_moves', (data) => {
      const whiteData = data.white;
      const blackData = data.black;
      const paused = me.paused;
      me.missingMoves = false;
      if (!paused) {
        if (me.color == WHITE) me.missingMoves = whiteData > 0;
        if (me.color == BLACK) me.missingMoves = blackData > 0;
      }
    });
  }

  ngOnDestroy(): void {
    const me = this;
    me.events_subscribed.forEach(event => {
      me.events.unsubscribe(event);
    });
  }

  public isClockDisabled(): boolean {
    const me = this;
    return me.paused || !me.toMove;
  }

  public getCurrentClockTime(): string {
    const me = this;
    const seconds = Math.ceil(me.state.seconds);
    setTimeout(() => me.cdr.detectChanges(), 1);
    return me.formatClockTime(seconds)
  }

  public checkNoTime() {
    const me = this;
    const seconds = me.state.seconds;
    return seconds <= 0;
  }

  public onClick(): void {
    const me = this;
    const seconds = me.state.seconds;

    if (me.paused || seconds <= 0) return;
    if (me.toMove) {
      me.clockPressed.emit();
      me.audioPlayer.play('clockHit');
      me.vibration.vibrate(100);
      me.cdr.detectChanges();
    }
  }

  protected checkTimeControl() {
    const me = this;
    const timeControl = me.timeControl;
    if (Utils.isClassicGame(timeControl)) return true;
    if (Utils.isScoreSheetWhiteGame(timeControl) && me.color === WHITE) return true;
    if (Utils.isScoreSheetBlackGame(timeControl) && me.color === BLACK) return true;
    return false;
  }

  private formatClockTime(seconds: number): string {
    const me = this;
    seconds = Math.ceil(seconds);
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds / 60) % 60;
    const secs = seconds % 60;
    let time = '';
    if (hours > 0) time += hours + ':';
    time += Utils.twoDigitsTime(mins) + ':' + Utils.twoDigitsTime(secs);
    return time;
  }

}
