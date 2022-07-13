import {ChessGame} from "../../utils/chess";
import {ClockSettings} from "./ClockSettings";
import {ClockState} from "./ClockState";
import {PlayerData} from "../../components/tools/tools";
import {Move} from "../../utils/utils";

export class PlayerState {

  constructor(public  chessGame: ChessGame,
              public  clockState: ClockState,
              public  firstRecordedMoveTimestamp: Date | undefined,
              public  lastRecordedMoveTimestamp: Date | undefined) {
  }

  public get movesCount(): number {
    const me = this;
    return me.clockState.moveCount;
  }

  public get unrecordedMoves(): number {
    const me = this;
    return me.clockState.moveCount || 0;
  }

  public get clockTimeString(): string {
    const me = this;
    return me.clockState.currentTime || '';
  }

  public get clockTimePgnString(): string {
    const me = this;
    return me.clockState.currentTimePgn || '';
  }

  public static create(chessGame: ChessGame, clockSettings: ClockSettings): PlayerState {
    return new PlayerState(chessGame, new ClockState(clockSettings), undefined, undefined);
  }

  public addInitialIncrement(): void {
    const me = this;
    me.clockState.addInitialIncrement();
  }

  public addMove(): void {
    const me = this;
    me.clockState.addMove();
  }

  public addMoveTime(): void {
    const me = this;
    me.clockState.addMoveTime();
  }

  public removeUnregisteredMove(): void {
    const me = this;
    me.clockState.removeMove();
  }

  public overwriteTime(playerData: PlayerData): void {
    const me = this;
    me.clockState.overwriteTime(playerData);
  }

  public forcePgnTime(timestamp: string, addMove: boolean): void {
    const me = this;
    let timeFormatRegex = new RegExp(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/);
    if (timeFormatRegex.test(timestamp)) me.clockState.parseStringTime(timestamp, addMove);
  }

  public addMoveCount(): void {
    const me = this;
    me.clockState.addMoveCount();
  }

  public removeMoveCount(): void {
    const me = this;
    me.clockState.removeMoveCount();
  }

  public recordMove(move: Move): void {
    const me = this;
    me.chessGame.do_move(move['san']);
    const now = new Date();
    me.firstRecordedMoveTimestamp = me.firstRecordedMoveTimestamp || now;
    me.lastRecordedMoveTimestamp = now;
  }

  public addElapsedTime(secondsElapsed: number): void {
    const me = this;
    if (secondsElapsed === 0) return;
    me.clockState.addElapsedTime(secondsElapsed);
  }

}
