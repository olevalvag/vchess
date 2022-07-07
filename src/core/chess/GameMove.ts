import {BLACK, DASH, Move, NEITHER, UNRECORDED, WHITE} from "../../utils/utils";

export class GameMove {
  public position: string;
  public active: boolean;
  public color: string;
  public move: Move;
  public moveTimestamp: string;
  public drawOffer: boolean;
  public overflowMove: Move;

  constructor(position: string, move: Move, active?: boolean, color?: string, moveTimestamp?: string, drawOffer?: boolean) {
    const me = this;
    me.position = position;
    me.move = move;
    me.active = active || true;
    me.color = color || '';
    me.moveTimestamp = moveTimestamp || '';
    me.drawOffer = drawOffer || false;
  }

  public get isUnrecordedMove(): boolean {
    const me = this;
    return me.position == UNRECORDED;
  }

  public get isDashMove(): boolean {
    const me = this;
    return me.position == DASH;
  }

  public get isUnrecordedWhiteMove(): boolean {
    const me = this;
    return me.position == UNRECORDED && me.color == WHITE;
  }

  public get isUnrecordedBlackMove(): boolean {
    const me = this;
    return me.position == UNRECORDED && me.color == BLACK;
  }

  public get isDashWhiteMove(): boolean {
    const me = this;
    return me.position == DASH && me.color == WHITE;
  }

  public get isDASHBlackMove(): boolean {
    const me = this;
    return me.position == DASH && me.color == BLACK;
  }

  public get hasDrawoffer(): boolean {
    const me = this;
    return me.drawOffer;
  }

  public get isValidMove(): boolean {
    const me = this;
    if (!me.active) return false;
    if (me.position == UNRECORDED) return false;
    if (me.position == DASH) return false;
    if (me.position == '') return false;
    return true;
  }

  public get isPieceMove(): boolean {
    const me = this;
    if (me.position == UNRECORDED) return false;
    if (me.position == DASH) return false;
    if (me.position == '') return false;
    return true;
  }

  public get isEmptyMove(): boolean {
    const me = this;
    return me.position == '';
  }

  public get getMoveShortSan(): string {
    const me = this;
    return me.move.san_short;
  }

  public get getMoveSan(): string {
    const me = this;
    return me.move.san;
  }

  public get getVisualMoveSan(): string {
    const me = this;
    return me.getMoveShortSan || me.getMoveSan;
  }

  public static createEmpty(): GameMove {
    let move = {from: '', to: '', san: ''};
    return new GameMove('', move, true, NEITHER, '');
  }

  public static createUnrecorded(color: string): GameMove {
    let move = {from: '', to: '', san: ''};
    return new GameMove(UNRECORDED, move, true, color, '');
  }

  public static createDash(color: string): GameMove {
    let move = {from: '', to: '', san: ''};
    return new GameMove(DASH, move, true, color, '');
  }

  public static createBlitz(color: string, moveTimestamp: string): GameMove {
    let move = {from: '', to: '', san: ''};
    return new GameMove(UNRECORDED, move, true, color, moveTimestamp);
  }

  public static create(move: Move, color: string, moveTimestamp: string, drawnOffer?: boolean): GameMove {
    return new GameMove(move['san'], move, true, color, moveTimestamp, drawnOffer);
  }

}
