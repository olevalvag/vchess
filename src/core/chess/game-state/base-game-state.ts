import {ClockSettings, stringifyClockSettings} from "../ClockSettings";
import {Events} from 'ionic-angular';
import Utils, {
  BLACK,
  Game,
  Move,
  NEITHER,
  ON_GOING_GAME,
  PgnConfig,
  PgnHeaders,
  PgnStructure,
  ScoreSheetLine,
  WHITE
} from '../../../utils/utils'
import {ChessGame} from "../../../utils/chess";
import {GameMove} from "../GameMove";
import {PlayerState} from "../PlayerState";
import {OnDestroy} from "@angular/core";
import _ from 'underscore'

export class BaseGameState implements OnDestroy {

  public moveHistoryList: Array<GameMove>;
  public backMoveList: Array<GameMove>;
  public clockPaused: boolean;
  public white: PlayerState;
  public black: PlayerState;
  public refreshClockTimer;

  public events_subscribed = ['score_sheet:overwrite'];

  constructor(public chessGame: ChessGame,
              public game: Game,
              public clockSettings: ClockSettings,
              public events: Events) {
    const me = this;
    me.initialize();
    me.start();
  }

  public get gameMovesHistory(): Array<GameMove> {
    const me = this;
    const piecesMoves = me.moveHistoryList.filter(x => x.isValidMove);
    return piecesMoves;
  }

  public get halfMoves(): number {
    const me = this;
    return me.white.unrecordedMoves + me.black.unrecordedMoves;
  }

  initialize() {
    const me = this;
    me.moveHistoryList = new Array<GameMove>();
    me.backMoveList = new Array<GameMove>();
    me.clockPaused = true;
    me.white = PlayerState.create(me.chessGame, me.clockSettings);
    me.black = PlayerState.create(me.chessGame, me.clockSettings);
    me.events.subscribe('score_sheet:overwrite', (newMoveList) => {
      me.moveHistoryList = newMoveList;
      me.events.publish('score_sheet:refresh', me.moveHistoryList);
    });
  }

  ngOnDestroy(): void {
    const me = this;
    me.events_subscribed.forEach(event => {
      me.events.unsubscribe(event);
    });
  }

  public parseNormalPgn(pgnData) {
    const me = this;
    let newGameMove;
    let move;
    let timestamp;
    let drawnOffer;
    const chessMovesHistory = me.chessGame.load_moves_pgn(pgnData, {sloppy: true});

    chessMovesHistory.forEach(moveData => {
      let color = NEITHER;
      move = me.chessGame.board_move(moveData['from'], moveData['to'], moveData['promotion']);
      if (!move) return;
      const san = move['san'];
      timestamp = moveData['clk'];
      drawnOffer = moveData['drawnOffer'];

      if (move['color'] == 'w') {
        me.white.addMoveCount();
        color = WHITE;
      } else {
        me.black.addMoveCount();
        color = BLACK;
      }
      newGameMove = GameMove.create(move, color, timestamp, drawnOffer);
      me.moveHistoryList.push(newGameMove);
      me.chessGame.do_move(move['san']);
    });
    me.parsePgnClocksData(pgnData, true);
    me.game.result = Utils.parseResultFromPgn(pgnData);
    setTimeout(() => {
      me.updateClocks();
      me.events.publish('score_sheet:refresh', me.moveHistoryList);
      me.events.publish('chess_game:remake', me.chessGame.get_fen());
      if (move) me.events.publish('square_highlight:updated', move);
    }, 500);
  }

  public parseBlitzPgn(pgnData) {
    const me = this;
    const moves = me.parsePgnMovesData(pgnData);
    const whiteMoves = moves[0];
    const blackMoves = moves[1];

    for (let i = 0; i < whiteMoves; i++) {
      me.white.addMove();
    }
    for (let i = 0; i < blackMoves; i++) {
      me.black.addMove();
    }
    me.parsePgnClocksData(pgnData, false);
    me.game.result = Utils.parseResultFromPgn(pgnData);
  }

  public parsePgn() {
    const me = this;
    const pgnData = me.game['pgn_data'];
    const timeControl = me.game.time_control;

    if (pgnData) {
      if (Utils.isBlitzGame(timeControl)) {
        me.parseBlitzPgn(pgnData);
      } else {
        me.parseNormalPgn(pgnData);
      }
    }
  }

  public addInitialIncrement() {
    const me = this;
    const pgnData = me.game['pgn_data'];
    if (!pgnData) {
      me.white.addInitialIncrement();
      me.black.addInitialIncrement();
    }
  }

  public parsePgnClocksData(pgnData, addMove) {
    const me = this;
    const whiteClockRegex = /(\[WhiteClock ")(.*)("])/;
    const blackClockRegex = /(\[BlackClock ")(.*)("])/;
    let whiteMatch = pgnData.match(whiteClockRegex);
    let blackMatch = pgnData.match(blackClockRegex);
    me.white.forcePgnTime(whiteMatch[2], addMove);
    me.black.forcePgnTime(blackMatch[2], addMove);
  }

  public parsePgnMovesData(pgnData) {
    const whiteMovesRegex = /(\[WhiteMoves ")(.*)("])/;
    const blackMovesRegex = /(\[BlackMoves ")(.*)("])/;
    let whiteMatch = pgnData.match(whiteMovesRegex);
    let blackMatch = pgnData.match(blackMovesRegex);
    const whiteMoves = whiteMatch ? whiteMatch[2] : 0;
    const blackMoves = blackMatch ? blackMatch[2] : 0;
    return [whiteMoves, blackMoves];
  }

  public whiteToMove(): boolean {
    const me = this;
    return me.white.unrecordedMoves <= me.black.unrecordedMoves;
  }

  public blackToMove(): boolean {
    const me = this;
    return me.white.unrecordedMoves > me.black.unrecordedMoves;
  }

  public boardPieceMove() {
    const me = this;

    if (me.clockPaused) {
      if (me.chessGame.current_turn() == 'w') return WHITE;
      if (me.chessGame.current_turn() == 'b') return BLACK;
    }
    return me.toMoveChess();
  }

  public toMoveChess(): string {
    const me = this;
    const moveHistoryList = me.moveHistoryList;
    const chessHistory = me.chessGame.game_moves_history();

    // Clock pause or first move
    if (me.clockPaused || me.halfMoves < 1) return NEITHER;

    // At least one unrecorded move on clock
    if (moveHistoryList.length == chessHistory.length) return NEITHER;
    if (me.chessGame.current_turn() == 'w') return WHITE;
    if (me.chessGame.current_turn() == 'b') return BLACK;
    return NEITHER;
  }

  public colorToMove(): string {
    const me = this;
    // if (me.clockPaused) return NEITHER;
    if (me.chessGame.current_turn() == 'w') return WHITE;
    if (me.chessGame.current_turn() == 'b') return BLACK;
    return NEITHER;
  }

  public updateClocks() {
    const me = this;
    me.refreshClockMissingMoves();
  }

  public addWhiteMove(): void {
    const me = this;
    me.white.addMove();
    me.moveHistoryList.push(GameMove.createUnrecorded(WHITE));
    me.events.publish('score_sheet:add_white_unrecorded');
    me.updateClocks();
  }

  public addBlackMove(): void {
    const me = this;
    me.black.addMove();
    me.moveHistoryList.push(GameMove.createUnrecorded(BLACK));
    me.events.publish('score_sheet:add_black_unrecorded');
    me.updateClocks();
  }

  public getMoveHistoryList() {
    const me = this;
    return me.moveHistoryList;
  }

  public recordMove(move: Move): void {
    const me = this;
    let moveTurn = me.colorToMove();
    let moveTimestamp;

    const success = () => {
      const recordMoves = [];
      const dashMoves = [];
      const unrecordMoves = [];
      let idx;
      let unrecordIdx = 0;

      _.forEach(me.moveHistoryList, (item) => {
        if (item.isValidMove) {
          recordMoves.push(item);
        } else if (item.isDashMove) {
          dashMoves.push(item);
        } else if (item.isUnrecordedMove) {
          unrecordMoves.push(item);
        }
      });

      if (dashMoves.length > 0) {
        dashMoves[0] = GameMove.create(move, moveTurn, moveTimestamp);
        unrecordIdx = 1;
      } else if (unrecordMoves.length > 0) {
        unrecordMoves[0] = GameMove.create(move, moveTurn, moveTimestamp);
        unrecordIdx = 1;
      } else {
        recordMoves.push(GameMove.create(move, moveTurn, moveTimestamp));
      }

      idx = recordMoves.length + unrecordIdx;
      me.moveHistoryList = recordMoves.concat(dashMoves).concat(unrecordMoves);
      me.updateScoreList(idx);
      me.refreshClockMissingMoves();
    };

    if (moveTurn == WHITE) {
      me.white.recordMove(move);
      moveTimestamp = me.whiteClockTime();
      success();
    } else if (moveTurn == BLACK) {
      me.black.recordMove(move);
      moveTimestamp = me.blackClockTime();
      success();
    }
  }

  public updateScoreList(idx) {
    const me = this;
    let moveHistoryList = me.moveHistoryList;
    me.events.publish('score_sheet:update', {moveHistoryList: moveHistoryList, idx: idx || moveHistoryList.length});
    me.events.publish('pgn:update');
  }

  public startStopClock(): void {
    const me = this;
    me.clockPaused = !me.clockPaused;
    me.updateClocks();
  }

  public addElapsedTime(secondsElapsed: number, forceColor?): void {
    const me = this;
    if (me.clockPaused) return;

    if (me.whiteToMove()) me.white.addElapsedTime(secondsElapsed);
    if (me.blackToMove()) me.black.addElapsedTime(secondsElapsed);
  }

  public overwriteMove(move: Move, singleMove?: boolean) {
    const me = this;
    let moveNumberIdx;
    const emptyMove = GameMove.createEmpty();
    let scoreSheetUpdate: ScoreSheetLine[] = [];
    let moveTimestamp;
    let moveTurn = me.colorToMove();
    let backMoveList = me.backMoveList;
    let moveHistoryList = me.moveHistoryList;
    const recordMoves = me.moveHistoryList.filter((x, i) => x.isPieceMove);
    const idx = recordMoves.length - backMoveList.length;

    const success = () => {
      const scoreIdx = idx % 2 != 0 ? idx - 1 : idx;

      for (let i = scoreIdx; i < moveHistoryList.length; i += 2) {
        const moveNumber = Math.floor(1 + i / 2);
        let whiteMove, blackMove;
        let itemA = moveHistoryList[i];
        let itemB = moveHistoryList[i + 1];

        if (i < idx) {
          whiteMove = itemA;
          moveHistoryList[i + 1] = moveHistoryList[i + 1] ? GameMove.createUnrecorded(itemB.color) : emptyMove;
        }

        if (i >= idx) {
          moveHistoryList[i] = moveHistoryList[i] ? GameMove.createUnrecorded(itemA.color) : emptyMove;
          moveHistoryList[i + 1] = moveHistoryList[i + 1] ? GameMove.createUnrecorded(itemB.color) : emptyMove;
        }

        if (i == idx) {
          moveNumberIdx = moveNumber;
          moveHistoryList[idx] = GameMove.create(move, moveTurn, moveTimestamp);
          if (i % 2 == 0) whiteMove = moveHistoryList[idx];
        } else if (i + 1 == idx) {
          moveNumberIdx = moveNumber;
          moveHistoryList[idx] = GameMove.create(move, moveTurn, moveTimestamp);
          if (i + 1 % 2 != 0) blackMove = moveHistoryList[idx];
        }

        scoreSheetUpdate.push({
          moveNumber: moveNumber,
          whiteMove: whiteMove || moveHistoryList[i],
          blackMove: blackMove || moveHistoryList[i + 1]
        });
      }

      me.events.publish('score_sheet:refresh_overwrite', scoreSheetUpdate, moveNumberIdx);
      me.events.publish('chess_game:overwrite', me.chessGame.get_fen());
      if (!singleMove) me.events.publish('pgn:update');
      me.backMoveList = [];
    };

    if (moveTurn == WHITE) {
      me.white.recordMove(move);
      moveTimestamp = me.whiteClockTime();
      success();
    }

    if (moveTurn == BLACK) {
      me.black.recordMove(move);
      moveTimestamp = me.blackClockTime();
      success();
    }
  }

  // ------------------------------------ OVERWRITE MOVES ---------------------------

  public undoMove() {
    const me = this;
    let moveHistoryList = me.moveHistoryList;
    let undoInfo;
    let lastAction;
    let idx;
    const chessHistory = me.chessGame.game_moves_history();

    if (chessHistory.length > 0) {
      idx = chessHistory.length - 1;
      lastAction = moveHistoryList[idx];
      undoInfo = me.chessGame.undo();
      if (!undoInfo) return;

      lastAction.active = false;
      me.backMoveList.push(lastAction);
      me.events.publish('chess_game:overwrite', me.chessGame.get_fen());
      me.events.publish('score_sheet:update', {idx: idx, moveHistoryList: moveHistoryList});
      return lastAction;
    }
  }

  public forwardMove() {
    const me = this;
    let moveHistoryList = me.moveHistoryList;
    let nextMove = me.backMoveList.pop();
    const move = nextMove.move;
    const from = move['from'];
    const to = move['to'];
    const promotion = move['promotion'];
    let newMove: any;

    if (promotion) {
      newMove = me.chessGame.board_move(from, to, promotion);
    } else {
      newMove = me.chessGame.board_move(from, to);
    }

    nextMove.active = true;
    if (nextMove.color == WHITE) {
      me.white.recordMove(newMove);
    }

    if (nextMove.color == BLACK) {
      me.black.recordMove(newMove);
    }

    const piece = move['promotion'] || move['piece'];
    me.chessGame.remove(newMove['from']);
    me.chessGame.put({type: piece, color: newMove['color']}, newMove['to']);
    me.events.publish('chess_game:overwrite', me.chessGame.get_fen());

    const chessHistory = me.chessGame.game_moves_history();
    const idx = chessHistory.length;
    me.events.publish('score_sheet:update', {idx: idx, moveHistoryList: moveHistoryList});
  }

  public result(): string {
    const me = this;
    return me.game.result || ON_GOING_GAME;
  }

  public buildPgnStructure(headers: PgnHeaders, pgnConfig: PgnConfig): PgnStructure {
    const me = this;
    const gameBaseInfo = {
      event: headers.event,
      site: headers.site,
      date: headers.date,
      group: headers.group,
      table: headers.table,
      round: headers.round,
      time_control: headers.time_control,
      white: headers.white,
      black: headers.black,
      whiteElo: headers.whiteElo,
      blackElo: headers.blackElo,
      clockSettings: stringifyClockSettings(me.clockSettings)
    };
    const gameVariableInfo = {
      result: headers.result,
      firstMoveRecorded: me.firstMoveTimestamp(),
      lastMoveRecorded: me.lastMoveTimestamp(),
      pgnUpdated: Utils.formatUTCTime(new Date()),
      currentFEN: headers.currentFEN,
      whiteClock: me.white.clockTimePgnString,
      blackClock: me.black.clockTimePgnString,
      whiteMoves: me.white.movesCount,
      blackMoves: me.black.movesCount,
      activeClock: headers.activeClock
    };
    let movesHistory = '';
    const timeControl = me.game.time_control;

    if (!Utils.isBlitzGame(timeControl)) {
      movesHistory = me.buildPgnHistory(pgnConfig);
    }

    const result: PgnStructure = {
      fixData: gameBaseInfo,
      variableData: gameVariableInfo,
      moves: movesHistory
    };
    return result;
  }

  // ------------------------------------ PGN -----------------------------------------

  public pgnString(pgn: PgnStructure): string {
    return Utils.pgnString(pgn);
  }

  public firstMoveTimestamp(): string {
    const me = this;
    let firstMoveTimestamp = '';
    const whiteFirst = me.white.firstRecordedMoveTimestamp;
    const blackFirst = me.black.firstRecordedMoveTimestamp;

    if (!whiteFirst || !blackFirst) return firstMoveTimestamp;
    if (whiteFirst < blackFirst) {
      firstMoveTimestamp = Utils.formatUTCTime(whiteFirst);
    } else {
      firstMoveTimestamp = Utils.formatUTCTime(blackFirst);
    }
    return firstMoveTimestamp;
  }

  public lastMoveTimestamp(): string {
    const me = this;
    let lastMoveTimestamp = '';
    const whiteLast = me.white.lastRecordedMoveTimestamp;
    const blackLast = me.black.lastRecordedMoveTimestamp;

    if (!whiteLast || !blackLast) return lastMoveTimestamp;
    if (whiteLast < blackLast) {
      lastMoveTimestamp = Utils.formatUTCTime(whiteLast);
    } else {
      lastMoveTimestamp = Utils.formatUTCTime(blackLast);
    }
    return lastMoveTimestamp;
  }

  public buildPgnHistory(pgnConfig: PgnConfig): string {
    const me = this;
    let historyResult = '';
    let i;
    const moveHistoryList = me.moveHistoryList;
    const historyList = moveHistoryList.filter(x => x.isValidMove);

    const pgnLine = function (_move) {
      const notation = specialNotation(_move);
      const clk = _move.moveTimestamp;
      const from = _move.move.from;
      const to = _move.move.to;
      const drawOffer = _move.drawOffer ? '1' : '0';

      let newLine = `${notation} {[%clk ${clk}]} {|${from}-${to}|} {draw_offered: ${drawOffer}} `;
      return newLine;
    };

    const specialNotation = function (inputMove) {
      const move = inputMove.move;
      const piece = move['piece'].toUpperCase();
      if (pgnConfig.sloppyNotation) {
        if (piece == 'N' || piece == 'B' || piece == 'R' || piece == 'Q') return `${piece}${move.from}${move.to}`;
      }
      return inputMove.position;
    };

    for (i = 0; i < historyList.length; i += 2) {
      const whiteMove = historyList[i];
      const blackMove = historyList[i + 1];
      const number = Math.ceil(1 + i / 2);
      let line = '';

      line += `${number}. `;
      let whiteLine = pgnLine(whiteMove);
      let blackLine = '';
      if (blackMove) blackLine = pgnLine(blackMove);
      historyResult += line + whiteLine + blackLine;
    }

    historyResult += ' ' + pgnConfig.gameResult;
    return historyResult;
  }

  public whiteClockTime(): string {
    const me = this;
    return me.white.clockTimeString;
  }

  public blackClockTime(): string {
    const me = this;
    return me.black.clockTimeString;
  }

  public getMovesCount(): number {
    const me = this;
    const chessHistory = me.chessGame.game_moves_history();
    return chessHistory.length || 0;
  }

  public addWhiteDashMove(): void {
  }

  public addBlackDashMove(): void {
  }

  // ------------------------------------ DASH HOOKS -----------------------------------------

  public addNextDash(color: string): void {
  }

  public replaceDashToMove(color: string): void {
  }

  private start() {
    const me = this;
    me.parsePgn();
    me.addInitialIncrement();
  }

  private refreshClockMissingMoves() {
    const me = this;
    const chessHistory = me.chessGame.game_moves_history();
    const moveHistoryList = me.moveHistoryList;
    const diff = moveHistoryList.length - chessHistory.length;
    let whiteMissingMoves = 0;
    let blackMissingMoves = 0;

    if (diff == 1) {
      const lastMove = moveHistoryList[moveHistoryList.length - 1];
      whiteMissingMoves = lastMove.color == WHITE ? 1 : 0;
      blackMissingMoves = lastMove.color == BLACK ? 1 : 0;
    } else if (diff >= 2) {
      whiteMissingMoves = 1;
      blackMissingMoves = 1;
    }

    if (me.refreshClockTimer) window.clearTimeout(me.refreshClockTimer);
    me.refreshClockTimer = setTimeout(() => {
      me.events.publish('clocks:update_missing_moves', {
        white: whiteMissingMoves,
        black: blackMissingMoves,
      });
    }, 300);
  }

}
