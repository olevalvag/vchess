import {ClockSettings} from "../ClockSettings";
import {Events} from 'ionic-angular';
import {BLACK, Game, Move, WHITE} from "../../../utils/utils";
import {ChessGame} from "../../../utils/chess";
import {GameMove} from "../GameMove";
import {BaseGameState} from "./base-game-state";

export class ScoresheetGameState extends BaseGameState {

  constructor(public chessGame: ChessGame,
              public game: Game,
              public clockSettings: ClockSettings,
              public events: Events) {
    super(chessGame, game, clockSettings, events);
  }


  public addWhiteMove(): void {
    const me = this;
    me.white.addMove();
    me.addNextDash(WHITE);
    me.updateClocks();
  }

  public addBlackMove(): void {
    const me = this;
    me.black.addMove();
    me.addNextDash(BLACK);
    me.updateClocks();
  }

  public updateScoreList(idx) {
    const me = this;
    let moveHistoryList = me.moveHistoryList;
    me.events.publish('score_sheet:update', {moveHistoryList: moveHistoryList, idx: idx || moveHistoryList.length});
    me.events.publish('pgn:update');
  }

  public addElapsedTime(secondsElapsed: number, forceColor?): void {
    const me = this;
    if (me.clockPaused) return;

    if (forceColor) {
      if (forceColor === WHITE) me.white.addElapsedTime(secondsElapsed);
      if (forceColor === BLACK) me.black.addElapsedTime(secondsElapsed);
    }
  }

  // ------------------------------------ OVERWRITE MOVES ---------------------

  public overwriteMove(move: Move, singleMove?: boolean) {
    const me = this;
    let moveTimestamp;
    let moveTurn = me.colorToMove();
    let backMoveList = me.backMoveList;
    let moveHistoryList = me.moveHistoryList;
    const recordMoves = me.moveHistoryList.filter((x, i) => x.isPieceMove);
    let idx = recordMoves.length - backMoveList.length;

    const success = () => {
      me.moveHistoryList.splice(idx);
      moveHistoryList.push(GameMove.create(move, moveTurn, moveTimestamp));

      me.events.publish('score_sheet:overwrite', me.moveHistoryList);
      me.events.publish('chess_game:overwrite', me.chessGame.get_fen());
      me.events.publish('pgn:update');
      me.backMoveList = [];
    };

    // Remove clock times for recorded moves
    for (let mv of backMoveList) {
      if (mv.color == WHITE) me.white.removeUnregisteredMove();
      if (mv.color == BLACK) me.black.removeUnregisteredMove();
    }

    // Remove moves counts for unrecorded moves
    const unrecordMoves = me.moveHistoryList.slice(recordMoves.length);
    for (let mv of unrecordMoves) {
      if (mv.color == WHITE) me.white.removeMoveCount();
      if (mv.color == BLACK) me.black.removeMoveCount();
    }

    if (moveTurn == WHITE) {
      me.white.recordMove(move);
      me.white.addMoveCount();
      moveTimestamp = me.whiteClockTime();
      success();
    }

    if (moveTurn == BLACK) {
      me.black.recordMove(move);
      me.black.addMoveCount();
      moveTimestamp = me.blackClockTime();
      success();
    }
  }

  // ------------------------------------ DASH -----------------------------------------

  public addWhiteDashMove(): void {
    const me = this;
    me.white.addMoveCount();
    me.moveHistoryList.push(GameMove.createDash(WHITE));
    me.events.publish('score_sheet:add_white_dash');
  }

  public addBlackDashMove(): void {
    const me = this;
    me.black.addMoveCount();
    me.moveHistoryList.push(GameMove.createDash(BLACK));
    me.events.publish('score_sheet:add_black_dash');
  }

  public addNextDash(color: string): void {
    const me = this;
    const dashMoves = me.moveHistoryList.filter((x, i) => x.isDashMove);
    if (dashMoves.length == 0) {
      me.moveHistoryList.push(GameMove.createDash(color));
      me.events.publish(`score_sheet:add_${color.toLowerCase()}_dash`);
    }
  }

  public replaceDashToMove(color: string): void {
    const me = this;
    if (color == WHITE) me.white.addMoveTime();
    if (color == BLACK) me.black.addMoveTime();
  }

}
