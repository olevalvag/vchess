import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Tablet, Tournament} from "../../../utils/utils";

export interface PlayerData {
  hours: number;
  minutes: number;
  seconds: number;
  moves: number;
}

@Component({
  selector: "tournament-tablet-info",
  templateUrl: "tournament-tablet-info.html"
})
export class TournamentTabletInfo implements OnInit {

  timer = null;
  continueCount = 10;

  @Input() tournament: Tournament;
  @Input() tablet: Tablet;
  @Input() continueCountdown: boolean;
  @Output() continueClick = new EventEmitter();

  constructor() {
    const me = this;
  }

  ngOnInit() {
    const me = this;
    me.continueCount = 10;
    if (me.continueCountdown) me.startContinueCountdown();
  }

  protected isTimerActive(): boolean {
    const me = this;
    return me.timer ? true : false;
  }

  protected onContinueClick() {
    const me = this;
    me.onLeave();
    me.continueClick.emit();
  }

  protected onCancelClick() {
    const me = this;
    window.clearInterval(me.timer);
    me.timer = null;
  }

  private startContinueCountdown() {
    const me = this;
    me.timer = window.setInterval(() => {
      me.continueCount = Math.max(0, me.continueCount - 1);
      if (me.continueCount <= 0) me.onContinueClick();
    }, 1000);
  }

  private onLeave(): void {
    const me = this;
    if (me.timer) window.clearInterval(me.timer);
  }

}
