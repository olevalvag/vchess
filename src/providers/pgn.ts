import Utils, {CLASSIC_TIME_CONTROL, ON_GOING_GAME, PgnHeaders, WHITE} from "../utils/utils";
import {GameMove} from "../core/chess/GameMove";

export class Pgn {

  headers: PgnHeaders;
  moves: Array<string>;

  constructor() {
    const me = this;
    me.headers = {
      event: '',
      site: '',
      date: '',
      group: '',
      table: 0,
      round: 0,
      time_control: CLASSIC_TIME_CONTROL,
      white: '',
      black: '',
      whiteElo: 0,
      blackElo: 0,
      result: ON_GOING_GAME,
      firstMoveRecorded: '',
      lastMoveRecorded: '',
      pgnUpdated: Utils.formatUTCTime(new Date()),
      whiteMoves: 0,
      blackMoves: 0,
      currentFEN: '',
      whiteClock: '',
      blackClock: '',
      activeClock: 'Paused',
    } as PgnHeaders;
    me.moves = new Array<string>();
  }

  /*public updatePgnData(values): void {
    const me = this;
    for(let key in values) {
      me.pgn[key] = values[key];
    }
  }*/

  public addMove(move: GameMove): void {
    const me = this;
    let newLive: string;
    const moves = me.moves;
    const movesCount = moves.length || 0;
    const lastMove = moves[moves.length - 1];
    const isWhiteMove = move.color === WHITE;
    const line = me.createPgnLine(move);

    if (isWhiteMove) {
      newLive = `${movesCount + 1}. ${line}`;
      me.moves.push(newLive);
    } else {
      newLive = `${line}`;
      me.moves[movesCount - 1] = lastMove + newLive;
    }
  }

  public printMoves() {
    const me = this;
    console.log(me.moves);
  }

  private createPgnLine(_move: GameMove) {
    const me = this;
    const notation = me.specialNotation(_move);
    const clk = _move.moveTimestamp;
    const from = _move.move.from;
    const to = _move.move.to;
    const drawOffer = _move.drawOffer ? '1' : '0';
    return `${notation} {[%clk ${clk}]} {|${from}-${to}|} {draw_offered: ${drawOffer}} `;
  };

  private specialNotation(inputMove) {
    const me = this;
    const move = inputMove.move;
    const piece = move['piece'].toUpperCase();
    if (piece == 'N' || piece == 'B' || piece == 'R' || piece == 'Q') return `${piece}${move.from}${move.to}`;
    return inputMove.position;
  };

}
