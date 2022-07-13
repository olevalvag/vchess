import {ClockSettings, ClockStage} from "./ClockSettings";
import Utils from "../../utils/utils";
import {PlayerData} from "../../components/tools/tools";

export class ClockState {

  constructor(
    public  settings: ClockSettings,
    public  seconds = settings.stages[0].timeInMinutes * 60,
    public  moveCount = 0) {
  }

  public get currentTime(): string {
    const me = this;
    return Utils.formatTime(me.seconds) || '';
  }

  public get currentTimePgn(): string {
    const me = this;
    return Utils.formatTimePgn(me.seconds) || '';
  }

  public addMove(): void {
    const me = this;
    if (me.seconds <= 0) {
      me.seconds = 0;
      return;
    }

    const stage = me.getStage(me.moveCount);
    const moveCount = me.moveCount + 1;
    const nextStage = me.getStage(moveCount);
    const newStageIncrement = nextStage === stage ? 0 : nextStage.timeInMinutes * 60;
    const seconds = me.seconds + stage.incrementInSeconds + newStageIncrement;

    me.seconds = seconds;
    me.moveCount = moveCount;
  }

  public addMoveTime(): void {
    const me = this;
    const moveCount = me.moveCount;

    if (me.seconds <= 0) {
      me.seconds = 0;
      return;
    }

    const stage = me.getStage(me.moveCount);
    const nextStage = me.getStage(moveCount);
    const newStageIncrement = nextStage === stage ? 0 : nextStage.timeInMinutes * 60;
    const seconds = me.seconds + stage.incrementInSeconds + newStageIncrement;
    me.seconds = seconds;
  }

  public addInitialIncrement(): void {
    const me = this;
    if (me.seconds <= 0) {
      me.seconds = 0;
      return;
    }
    const stage = me.getStage(me.moveCount);
    const seconds = me.seconds + stage.incrementInSeconds;
    me.seconds = seconds;
  }

  public parseStringTime(timestamp: string, addMove: boolean): void {
    const me = this;
    let time = timestamp.split(':');
    const hoursInSeconds = Number(time[0] || 0) * 60 * 60;
    const minutesInSeconds = Number(time[1] || 0) * 60;
    const seconds = Number(time[2] || 0);
    me.seconds = hoursInSeconds + minutesInSeconds + seconds;
    // if (addMove) me.moveCount = me.moveCount + 1;
  }

  public overwriteTime(playerData: PlayerData): void {
    const me = this;
    const seconds = (playerData.hours || 0) * 60 * 60 + (playerData.minutes || 0) * 60 + (playerData.seconds || 0);
    me.seconds = seconds;
  }

  public addMoveCount(): void {
    const me = this;

    if (me.seconds <= 0) {
      me.seconds = 0;
      return;
    }
    me.moveCount = me.moveCount + 1;
  }

  public removeMoveCount(): void {
    const me = this;
    me.moveCount = Math.max(0, me.moveCount - 1);
  }

  public removeMove(): void {
    const me = this;
    if (me.seconds <= 0) {
      me.seconds = 0;
      return;
    }
    const moveCount = me.moveCount;
    const nextMoveCount = Math.max(0, moveCount - 1);
    const currentStage = me.getStage(moveCount);
    const nextStage = me.getStage(nextMoveCount);
    const newStageJump = nextStage === currentStage ? 0 : currentStage.timeInMinutes * 60;
    const seconds = me.seconds - currentStage.incrementInSeconds - newStageJump;
    me.seconds = Math.max(0, seconds);
    me.moveCount = nextMoveCount;
  }

  public addElapsedTime(secondsElapsed: number): void {
    const me = this;
    if (secondsElapsed === 0) return;
    const seconds = Math.max(0, this.seconds - secondsElapsed);
    me.seconds = seconds;
  }

  private getStage(moveCount: number): ClockStage {
    const me = this;
    const defaultStage: ClockStage = {
      timeInMinutes: 15,
      incrementInSeconds: 30,
      incrementType: "fischer",
      moves: Infinity
    };
    let m = moveCount;

    for (const stage of me.settings.stages) {
      if (stage.moves) {
        if (m < stage.moves) return stage;
        m -= stage.moves;
      }
    }

    if (me.settings.stages[0]) return me.settings.stages[0];
    return defaultStage;
  }

}
