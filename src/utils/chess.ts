import {Injectable} from "@angular/core";
import {Events} from 'ionic-angular';

const BLACK = 'b';
const WHITE = 'w';
const EMPTY = -1;
const PAWN = 'p';
const KNIGHT = 'n';
const BISHOP = 'b';
const ROOK = 'r';
const QUEEN = 'q';
const KING = 'k';
const SYMBOLS = 'pnbrqkPNBRQK';
const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];
const PAWN_OFFSETS = {
  b: [16, 32, 17, 15],
  w: [-16, -32, -17, -15]
};
const PIECE_OFFSETS = {
  n: [-18, -33, -31, -14, 18, 33, 31, 14],
  b: [-17, -15, 17, 15],
  r: [-16, 1, 16, -1],
  q: [-17, -16, -15, 1, 17, 16, 15, -1],
  k: [-17, -16, -15, 1, 17, 16, 15, -1]
};
const ATTACKS = [
  20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0,
  0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
  0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
  0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
  0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
  24, 24, 24, 24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0,
  0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
  0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
  0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
  0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
  20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20
];
const RAYS = [
  17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0,
  0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0,
  0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0,
  0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0,
  0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0,
  0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0,
  0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0,
  0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0,
  0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0,
  -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17
];
const SHIFTS = {p: 0, n: 1, b: 2, r: 3, q: 4, k: 5};
const FLAGS = {
  NORMAL: 'n',
  CAPTURE: 'c',
  BIG_PAWN: 'b',
  EP_CAPTURE: 'e',
  PROMOTION: 'p',
  KSIDE_CASTLE: 'k',
  QSIDE_CASTLE: 'q'
};
const BITS = {
  NORMAL: 1,
  CAPTURE: 2,
  BIG_PAWN: 4,
  EP_CAPTURE: 8,
  PROMOTION: 16,
  KSIDE_CASTLE: 32,
  QSIDE_CASTLE: 64
};
const RANK_1 = 7;
const RANK_2 = 6;
const RANK_3 = 5;
const RANK_4 = 4;
const RANK_5 = 3;
const RANK_6 = 2;
const RANK_7 = 1;
const RANK_8 = 0;
let SQUARES = {
  a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
  a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,
  a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,
  a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,
  a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,
  a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,
  a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,
  a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
};
let ROOKS = {
  w: [{square: SQUARES.a1, flag: BITS.QSIDE_CASTLE},
    {square: SQUARES.h1, flag: BITS.KSIDE_CASTLE}],
  b: [{square: SQUARES.a8, flag: BITS.QSIDE_CASTLE},
    {square: SQUARES.h8, flag: BITS.KSIDE_CASTLE}]
};

@Injectable()
export class ChessGame {

  public last_moves;
  public turn: string;
  public history: Array<any>;
  public board: Array<any>;
  public ep_square;
  public half_moves;
  public move_number;
  public kings;
  public castling;
  public header;

  constructor(public events: Events) {
    const me = this;
    me.turn = WHITE;
    me.history = new Array<any>();
    me.board = new Array<any>(128);
    me.ep_square = EMPTY;
    me.half_moves = 0;
    me.half_moves = 0;
    me.move_number = 1;
    me.kings = {w: EMPTY, b: EMPTY};
    me.header = {};
    me.castling = {w: 0, b: 0};
    me.load(DEFAULT_POSITION);
  }

  clear() {
    const me = this;
    me.history = new Array<any>();
    me.board = new Array(128);
    me.kings = {w: EMPTY, b: EMPTY};
    me.turn = WHITE;
    me.castling = {w: 0, b: 0};
    me.ep_square = EMPTY;
    me.half_moves = 0;
    me.move_number = 1;
    me.board = new Array<any>(128);
    me.header = {};
    me.update_setup(me.generate_fen());
  }

  reset() {
    const me = this;
    me.clear();
    me.load(DEFAULT_POSITION);
  }

  load(fen) {
    const me = this;
    let tokens = fen.split(/\s+/);
    let position = tokens[0];
    let square = 0;

    if (!me.validate_fen(fen).valid) {
      return false;
    }

    me.clear();

    for (let i = 0; i < position.length; i++) {
      let piece = position.charAt(i);

      if (piece === '/') {
        square += 8;
      } else if (me.is_digit(piece)) {
        square += parseInt(piece, 10);
      } else {
        let color = (piece < 'a') ? WHITE : BLACK;
        me.put({type: piece.toLowerCase(), color: color}, me.algebraic(square));
        square++;
      }
    }

    me.turn = tokens[1];

    if (tokens[2].indexOf('K') > -1) {
      me.castling.w |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('Q') > -1) {
      me.castling.w |= BITS.QSIDE_CASTLE;
    }
    if (tokens[2].indexOf('k') > -1) {
      me.castling.b |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('q') > -1) {
      me.castling.b |= BITS.QSIDE_CASTLE;
    }

    me.ep_square = (tokens[3] === '-') ? EMPTY : SQUARES[tokens[3]];
    me.half_moves = parseInt(tokens[4], 10);
    me.move_number = parseInt(tokens[5], 10);

    me.update_setup(me.generate_fen());

    return true;
  }

  validate_fen(fen) {
    const me = this;
    let errors = {
      0: 'No errors.',
      1: 'FEN string must contain six space-delimited fields.',
      2: '6th field (move number) must be a positive integer.',
      3: '5th field (half move counter) must be a non-negative integer.',
      4: '4th field (en-passant square) is invalid.',
      5: '3rd field (castling availability) is invalid.',
      6: '2nd field (side to move) is invalid.',
      7: '1st field (piece positions) does not contain 8 \'/\'-delimited rows.',
      8: '1st field (piece positions) is invalid [consecutive numbers].',
      9: '1st field (piece positions) is invalid [invalid piece].',
      10: '1st field (piece positions) is invalid [row too large].',
      11: 'Illegal en-passant square',
    };

    /* 1st criterion: 6 space-seperated fields? */
    let tokens = fen.split(/\s+/);
    if (tokens.length !== 6) {
      return {valid: false, error_number: 1, error: errors[1]};
    }

    /* 2nd criterion: move number field is a integer value > 0? */
    if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
      return {valid: false, error_number: 2, error: errors[2]};
    }

    /* 3rd criterion: half move counter is an integer >= 0? */
    if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
      return {valid: false, error_number: 3, error: errors[3]};
    }

    /* 4th criterion: 4th field is a valid e.p.-string? */
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
      return {valid: false, error_number: 4, error: errors[4]};
    }

    /* 5th criterion: 3th field is a valid castle-string? */
    if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
      return {valid: false, error_number: 5, error: errors[5]};
    }

    /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
    if (!/^(w|b)$/.test(tokens[1])) {
      return {valid: false, error_number: 6, error: errors[6]};
    }

    /* 7th criterion: 1st field contains 8 rows? */
    let rows = tokens[0].split('/');
    if (rows.length !== 8) {
      return {valid: false, error_number: 7, error: errors[7]};
    }

    /* 8th criterion: every row is valid? */
    for (let i = 0; i < rows.length; i++) {
      /* check for right sum of fields AND not two numbers in succession */
      let sum_fields = 0;
      let previous_was_number = false;

      for (let k = 0; k < rows[i].length; k++) {
        if (!isNaN(rows[i][k])) {
          if (previous_was_number) {
            return {valid: false, error_number: 8, error: errors[8]};
          }
          sum_fields += parseInt(rows[i][k], 10);
          previous_was_number = true;
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            return {valid: false, error_number: 9, error: errors[9]};
          }
          sum_fields += 1;
          previous_was_number = false;
        }
      }
      if (sum_fields !== 8) {
        return {valid: false, error_number: 10, error: errors[10]};
      }
    }

    if ((tokens[3][1] == '3' && tokens[1] == 'w') ||
      (tokens[3][1] == '6' && tokens[1] == 'b')) {
      return {valid: false, error_number: 11, error: errors[11]};
    }

    /* everything's okay! */
    return {valid: true, error_number: 0, error: errors[0]};
  }

  generate_fen() {
    const me = this;
    let empty = 0;
    let fen = '';

    for (let i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (me.board[i] == null) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        let color = me.board[i].color;
        let piece = me.board[i].type;

        fen += (color === WHITE) ?
          piece.toUpperCase() : piece.toLowerCase();
      }

      if ((i + 1) & 0x88) {
        if (empty > 0) {
          fen += empty;
        }

        if (i !== SQUARES.h1) {
          fen += '/';
        }

        empty = 0;
        i += 8;
      }
    }

    let cflags = '';
    if (me.castling[WHITE] & BITS.KSIDE_CASTLE) {
      cflags += 'K';
    }
    if (me.castling[WHITE] & BITS.QSIDE_CASTLE) {
      cflags += 'Q';
    }
    if (me.castling[BLACK] & BITS.KSIDE_CASTLE) {
      cflags += 'k';
    }
    if (me.castling[BLACK] & BITS.QSIDE_CASTLE) {
      cflags += 'q';
    }

    /* do we have an empty castling flag? */
    cflags = cflags || '-';
    let epflags = (me.ep_square === EMPTY) ? '-' : me.algebraic(me.ep_square);

    return [fen, me.turn, cflags, epflags, me.half_moves, me.move_number].join(' ');
  }

  /* called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object.  if the FEN is
   * equal to the default position, the SetUp and FEN are deleted
   * the setup is only updated if history.length is zero, ie moves haven't been
   * made.
   */
  update_setup(fen) {
    const me = this;
    if (me.history.length > 0) return;

    if (fen !== DEFAULT_POSITION) {
      me.header['SetUp'] = '1';
      me.header['FEN'] = fen;
    } else {
      delete me.header['SetUp'];
      delete me.header['FEN'];
    }
  }

  get(square) {
    const me = this;
    let piece = me.board[SQUARES[square]];
    return (piece) ? {type: piece.type, color: piece.color} : null;
  }

  put(piece, square) {
    const me = this;
    /* check for valid piece object */
    if (!('type' in piece && 'color' in piece)) {
      return false;
    }

    /* check for piece */
    if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
      return false;
    }

    /* check for valid square */
    if (!(square in SQUARES)) {
      return false;
    }

    let sq = SQUARES[square];

    /* don't let the user place more than one king */
    if (piece.type == KING && !(me.kings[piece.color] == EMPTY || me.kings[piece.color] == sq)) {
      return false;
    }

    me.board[sq] = {type: piece.type, color: piece.color};
    if (piece.type === KING) {
      me.kings[piece.color] = sq;
    }

    me.update_setup(me.generate_fen());

    return true;
  }

  remove(square) {
    const me = this;
    let piece = me.get(square);
    me.board[SQUARES[square]] = null;
    if (piece && piece.type === KING) {
      me.kings[piece.color] = EMPTY;
    }

    me.update_setup(me.generate_fen());

    return piece;
  }

  build_move(board, from, to, flags, promotion?) {
    const me = this;
    let move = {
      color: me.turn,
      from: from,
      to: to,
      flags: flags,
      piece: board[from].type
    };

    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move['promotion'] = promotion;
    }

    if (board[to]) {
      move['captured'] = board[to].type;
    } else if (flags & BITS.EP_CAPTURE) {
      move['captured'] = PAWN;
    }
    return move;
  }

  /* convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   *
   * @param {boolean} sloppy Use the sloppy SAN generator to work around over
   * disambiguation bugs in Fritz and Chessbase.  See below:
   *
   * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
   * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
   * 4. ... Ne7 is technically the valid SAN
   */

  /*move_to_san_short(move, sloppy?) {
    const me = this;
    let output = '';

    if (move.flags & BITS.KSIDE_CASTLE) {
      output = 'O-O';
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      output = 'O-O-O';
    } else {
      let disambiguator = me.get_disambiguator(move, sloppy);
      if (move.piece !== PAWN) output += move.piece.toUpperCase() + disambiguator;
      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (move.piece === PAWN) output += me.algebraic(move.from)[0];
        output += 'x';
      }
      output += me.algebraic(move.to);
      if (move.flags & BITS.PROMOTION) output += '=' + move.promotion.toUpperCase();
    }

    if (me.in_check()) {
      if (me.in_checkmate()) {
        output += '#';
      } else {
        output += '+';
      }
    }
    return output;
  }*/

  move_to_san(move, sloppy?, includeShort?) {
    const me = this;
    let output = '';
    let output_short = '';

    if (move.flags & BITS.KSIDE_CASTLE) {
      output = 'O-O';
      output_short = 'O-O';
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      output = 'O-O-O';
      output_short = 'O-O-O';
    } else {
      let disambiguator = me.get_disambiguator(move, sloppy);

      if (move.piece !== PAWN) {
        output += move.piece.toUpperCase() + disambiguator;
        output_short += move.piece.toUpperCase() + disambiguator;
      }

      // --------------- SHORT NOTATION
      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (move.piece === PAWN) output_short += me.algebraic(move.from)[0];
        output_short += 'x';
      }
      output_short += me.algebraic(move.to);
      if (move.flags & BITS.PROMOTION) output_short += '=' + move.promotion.toUpperCase();

      // --------------- LONG NOTATION
      output += me.algebraic(move.from);
      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) output += 'x';
      output += me.algebraic(move.to);
      if (move.flags & BITS.PROMOTION) output += '=' + move.promotion.toUpperCase();
    }

    me.make_move(move);
    if (me.in_check()) {
      if (me.in_checkmate()) {
        output += '#';
        output_short += '#';
      } else {
        output += '+';
        output_short += '+';
      }
    }
    me.undo_move();

    return includeShort ? [output, output_short] : output;
  }

  attacked(color, square) {
    const me = this;
    for (let i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) {
        i += 7;
        continue;
      }

      /* if empty square or wrong color */
      if (me.board[i] == null || me.board[i].color !== color) continue;

      let piece = me.board[i];
      let difference = i - square;
      let index = difference + 119;

      if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
        if (piece.type === PAWN) {
          if (difference > 0) {
            if (piece.color === WHITE) return true;
          } else {
            if (piece.color === BLACK) return true;
          }
          continue;
        }

        /* if the piece is a knight or a king */
        if (piece.type === 'n' || piece.type === 'k') return true;

        let offset = RAYS[index];
        let j = i + offset;

        let blocked = false;
        while (j !== square) {
          if (me.board[j] != null) {
            blocked = true;
            break;
          }
          j += offset;
        }

        if (!blocked) return true;
      }
    }

    return false;
  }

  king_attacked(color) {
    const me = this;
    return me.attacked(me.swap_color(color), me.kings[color]);
  }

  in_check() {
    const me = this;
    return me.king_attacked(me.turn);
  }

  in_checkmate() {
    const me = this;
    let moves = me.last_moves || [];
    return me.in_check() && moves.length === 0;
  }

  in_stalemate() {
    const me = this;
    let moves = me.last_moves || [];
    return !me.in_check() && moves.length === 0;
  }

  insufficient_material() {
    const me = this;
    let pieces = {};
    let bishops = [];
    let num_pieces = 0;
    let sq_color = 0;

    for (let i = SQUARES.a8; i <= SQUARES.h1; i++) {
      sq_color = (sq_color + 1) % 2;
      if (i & 0x88) {
        i += 7;
        continue;
      }

      let piece = me.board[i];
      if (piece) {
        pieces[piece.type] = (piece.type in pieces) ?
          pieces[piece.type] + 1 : 1;
        if (piece.type === BISHOP) {
          bishops.push(sq_color);
        }
        num_pieces++;
      }
    }

    /* k vs. k */
    if (num_pieces === 2) {
      return true;
    }

    /* k vs. kn .... or .... k vs. kb */
    else if (num_pieces === 3 && (pieces[BISHOP] === 1 ||
      pieces[KNIGHT] === 1)) {
      return true;
    }

    /* kb vs. kb where any number of bishops are all on the same color */
    else if (num_pieces === pieces[BISHOP] + 2) {
      let sum = 0;
      let len = bishops.length;
      for (let i = 0; i < len; i++) {
        sum += bishops[i];
      }
      if (sum === 0 || sum === len) {
        return true;
      }
    }

    return false;
  }

  in_threefold_repetition() {
    const me = this;
    let moves = [];
    let positions = {};
    let repetition = false;

    while (true) {
      let move = me.undo_move();
      if (!move) break;
      moves.push(move);
    }

    while (true) {
      /* remove the last two fields in the FEN string, they're not needed
       * when checking for draw by rep */
      let fen = me.generate_fen().split(' ').slice(0, 4).join(' ');

      /* has the position occurred three or move times */
      positions[fen] = (fen in positions) ? positions[fen] + 1 : 1;
      if (positions[fen] >= 3) {
        repetition = true;
      }

      if (!moves.length) {
        break;
      }
      me.make_move(moves.pop());
    }

    return repetition;
  }

  push(move) {
    const me = this;
    me.history.push({
      move: move,
      kings: {b: me.kings.b, w: me.kings.w},
      turn: me.turn,
      castling: {b: me.castling.b, w: me.castling.w},
      ep_square: me.ep_square,
      half_moves: me.half_moves,
      move_number: me.move_number
    });
  }

  make_move(move) {
    const me = this;
    let us = me.turn;
    let them = me.swap_color(us);
    me.push(move);

    me.board[move.to] = me.board[move.from];
    me.board[move.from] = null;

    /* if ep capture, remove the captured pawn */
    if (move.flags & BITS.EP_CAPTURE) {
      if (me.turn === BLACK) {
        me.board[move.to - 16] = null;
      } else {
        me.board[move.to + 16] = null;
      }
    }

    /* if pawn promotion, replace with new piece */
    if (move.flags & BITS.PROMOTION) {
      me.board[move.to] = {type: move.promotion, color: us};
    }

    /* if we moved the king */
    if (me.board[move.to].type === KING) {
      me.kings[me.board[move.to].color] = move.to;

      /* if we castled, move the rook next to the king */
      if (move.flags & BITS.KSIDE_CASTLE) {
        let castling_to: number = move.to - 1;
        let castling_from: number = move.to + 1;
        me.board[castling_to] = me.board[castling_from];
        me.board[castling_from] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        let castling_to: number = move.to + 1;
        let castling_from: number = move.to - 2;
        me.board[castling_to] = me.board[castling_from];
        me.board[castling_from] = null;
      }

      /* turn off castling */
      me.castling[us] = '';
    }

    /* turn off castling if we move a rook */
    if (me.castling[us]) {
      for (let i = 0, len = ROOKS[us].length; i < len; i++) {
        if (move.from === ROOKS[us][i].square &&
          me.castling[us] & ROOKS[us][i].flag) {
          me.castling[us] ^= ROOKS[us][i].flag;
          break;
        }
      }
    }

    /* turn off castling if we capture a rook */
    if (me.castling[them]) {
      for (let i = 0, len = ROOKS[them].length; i < len; i++) {
        if (move.to === ROOKS[them][i].square &&
          me.castling[them] & ROOKS[them][i].flag) {
          me.castling[them] ^= ROOKS[them][i].flag;
          break;
        }
      }
    }

    /* if big pawn move, update the en passant square */
    if (move.flags & BITS.BIG_PAWN) {
      if (me.turn === 'b') {
        me.ep_square = move.to - 16;
      } else {
        me.ep_square = move.to + 16;
      }
    } else {
      me.ep_square = EMPTY;
    }

    /* reset the 50 move counter if a pawn is moved or a piece is captured */
    if (move.piece === PAWN) {
      me.half_moves = 0;
    } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      me.half_moves = 0;
    } else {
      me.half_moves++;
    }

    if (me.turn === BLACK) {
      me.move_number++;
    }
    me.turn = me.swap_color(me.turn);
  }

  undo_move() {
    const me = this;
    let old = me.history.pop();
    if (old == null) return null;

    let move = old.move;
    me.kings = old.kings;
    me.turn = old.turn;
    me.castling = old.castling;
    me.ep_square = old.ep_square;
    me.half_moves = old.half_moves;
    me.move_number = old.move_number;

    let us = me.turn;
    let them = me.swap_color(me.turn);

    me.board[move.from] = me.board[move.to];
    me.board[move.from].type = move.piece;  // to undo any promotions
    me.board[move.to] = null;

    if (move.flags & BITS.CAPTURE) {
      me.board[move.to] = {type: move.captured, color: them};
    } else if (move.flags & BITS.EP_CAPTURE) {
      let index;
      if (us === BLACK) {
        index = move.to - 16;
      } else {
        index = move.to + 16;
      }
      me.board[index] = {type: PAWN, color: them};
    }


    if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
      let castling_to, castling_from;
      if (move.flags & BITS.KSIDE_CASTLE) {
        castling_to = move.to + 1;
        castling_from = move.to - 1;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        castling_to = move.to - 2;
        castling_from = move.to + 1;
      }

      me.board[castling_to] = me.board[castling_from];
      me.board[castling_from] = null;
    }

    return move;
  }

  // TODO NEDDED??
  /* this function is used to uniquely identify ambiguous moves */
  get_disambiguator(move, sloppy) {
    const me = this;
    let moves = me.last_moves || [];

    let from = move.from;
    let to = move.to;
    let piece = move.piece;

    let ambiguities = 0;
    let same_rank = 0;
    let same_file = 0;

    for (let i = 0, len = moves.length; i < len; i++) {
      let ambig_from = moves[i].from;
      let ambig_to = moves[i].to;
      let ambig_piece = moves[i].piece;

      /* if a move of the same piece type ends on the same to square, we'll
       * need to add a disambiguator to the algebraic notation
       */
      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++;

        if (me.rank(from) === me.rank(ambig_from)) {
          same_rank++;
        }

        if (me.file(from) === me.file(ambig_from)) {
          same_file++;
        }
      }
    }

    if (ambiguities > 0) {
      /* if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      if (same_rank > 0 && same_file > 0) {
        return me.algebraic(from);
      }
      /* if the moving piece rests on the same file, use the rank symbol as the
       * disambiguator
       */
      else if (same_file > 0) {
        return me.algebraic(from).charAt(1);
      }
      /* else use the file symbol */
      else {
        return me.algebraic(from).charAt(0);
      }
    }

    return '';
  }

  rank(i) {
    const me = this;
    return i >> 4;
  }

  file(i) {
    const me = this;
    return i & 15;
  }

  algebraic(i) {
    const me = this;
    let f = me.file(i), r = me.rank(i);
    return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1);
  }

  swap_color(c) {
    return c === WHITE ? BLACK : WHITE;
  }

  is_digit(c) {
    return '0123456789'.indexOf(c) !== -1;
  }

  make_pretty(ugly_move, sloppy) {
    const me = this;
    let flags = '';
    let move = me.clone(ugly_move);
    const moveSan = me.move_to_san(move, sloppy, true);

    move['san'] = moveSan[0];
    move['san_short'] = moveSan[1];
    move['to'] = me.algebraic(move['to']);
    move['from'] = me.algebraic(move['from']);
    //move['san_short'] = me.move_to_san_short(move, sloppy);

    for (let flag in BITS) {
      if (BITS[flag] & move['flags']) {
        flags += FLAGS[flag];
      }
    }
    move['flags'] = flags;

    return move;
  }

  clone(obj) {
    const me = this;
    let dupe = {};

    for (let property in obj) {
      dupe[property] = obj[property];
    }

    return dupe;
  }

  trim(str) {
    const me = this;
    return str.replace(/^\s+|\s+$/g, '');
  }

  stripped_san(move) {
    const me = this;
    return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '');
  }

  move_from_san(move, sloppy) {
    const me = this;
    let clean_move = me.stripped_san(move);
    let matches, piece, from, to, promotion;

    if (sloppy) {
      let matches = clean_move.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/);
      if (matches) {
        piece = matches[1];
        from = matches[2];
        to = matches[3];
        promotion = matches[4];
      }
    }

    let moves = me.last_moves || [];
    for (let i = 0, len = moves.length; i < len; i++) {
      // try the strict parser first, then the sloppy parser if requested by the user
      if ((clean_move === me.stripped_san(me.move_to_san(moves[i]))) ||
        (sloppy && clean_move === me.stripped_san(me.move_to_san(moves[i], true)))) {
        return moves[i];
      } else {
        if (matches &&
          (!piece || piece.toLowerCase() == moves[i].piece) &&
          SQUARES[from] == moves[i].from &&
          SQUARES[to] == moves[i].to &&
          (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
          return moves[i];
        }
      }
    }

    return null;
  }

  set_header(args) {
    const me = this;
    for (let i = 0; i < args.length; i += 2) {
      if (typeof args[i] === 'string' &&
        typeof args[i + 1] === 'string') {
        me.header[args[i]] = args[i + 1];
      }
    }
    return me.header;
  }

  game_history(options) {
    const me = this;
    let sloppy = true;
    let reversed_history = [];
    let move_history = [];
    let verbose = (typeof options !== 'undefined' && 'verbose' in options && options.verbose);

    while (history.length > 0) {
      reversed_history.push(me.undo_move());
    }

    while (reversed_history.length > 0) {
      let move = reversed_history.pop();
      if (verbose) {
        move_history.push(me.make_pretty(move, sloppy));
      } else {
        move_history.push(me.move_to_san(move, sloppy));
      }
      me.make_move(move);
    }

    return move_history;
  }

  //////////////////////////////////////// PUBLIC ///////////////////////////////////////

  public oppositeColor(color: string) {
    if (color == 'w') return 'b';
    if (color == 'b') return 'w';
    return '';
  }

  check_position(from_position) {
    const me = this;
    let from_square = SQUARES[from_position];
    return me.board[from_square];
  }

  build_promotion_premove(from: string, to: string) {
    const me = this;
    const us = me.turn;
    const them = me.swap_color(us);
    const from_square = SQUARES[from];
    const from_piece = me.board[from_square];
    const to_square = SQUARES[to];
    const to_piece = me.board[to_square];
    let flags = BITS.NORMAL;

    if (to_piece != null && to_piece.color === them) flags = BITS.CAPTURE;
    let move = me.build_move(me.board, from_square, to_square, flags)
    return move ? me.make_pretty(move, true) : null;
  }

  check_overlapping(move) {
    const me = this;
    let from_square = SQUARES[move.from];
    let to_square = SQUARES[move.to];
    let board_source = me.board[from_square];
    let board_target = me.board[to_square];

    if (!board_source || !board_target) return false;
    return board_source.color == board_target.color;
  }

  do_move(move) {
    const me = this;
    let move_obj = me.move_from_san(move, true);
    let pretty_move = me.make_pretty(move_obj, true);
    me.make_move(move_obj);
    return pretty_move;
  }

  get_fen() {
    const me = this;
    return me.generate_fen();
  }

  current_turn() {
    return this.turn;
  }

  game_moves_history() {
    const me = this;
    return this.history;
  }

  undo() {
    const me = this;
    let move = me.undo_move();
    return (move) ? move : null;
    // return (move) ? me.make_pretty(move, true) : null;
  }

  ///////////////////////////////////// ILLEGAL MOVES ///////////////////////////////////////

  board_move(from_position, to_position, promotionPiece?) {
    const me = this;
    let moves = [];
    let us = me.turn;
    let them = me.swap_color(us);
    let second_rank = {b: RANK_7, w: RANK_2};
    let from_square = SQUARES[from_position];
    let to_square = SQUARES[to_position];

    let from_piece = me.board[from_square];
    let to_piece = me.board[to_square];

    let add_move = (board, moves, from, to, flags) => {
      if (board[from].type === PAWN && (me.rank(to) === RANK_8 || me.rank(to) === RANK_1)) {
        moves.push(me.build_move(board, from, to, flags, promotionPiece));
      } else {
        moves.push(me.build_move(board, from, to, flags));
      }
    };

    if (!from_piece) return null;
    if (from_piece.type === PAWN) {
      let big_pawn_square = from_square + PAWN_OFFSETS[us][1];
      if (to_square === me.ep_square) {
        add_move(me.board, moves, from_square, me.ep_square, BITS.EP_CAPTURE);
      } else if (to_piece != null && to_piece.color === them) {
        add_move(me.board, moves, from_square, to_square, BITS.CAPTURE);
      } else if (second_rank[us] === me.rank(from_square) && to_square == big_pawn_square && to_piece == null) {
        add_move(me.board, moves, from_square, to_square, BITS.BIG_PAWN);
      } else if (to_piece != null && to_piece.color === us) {
        add_move(me.board, moves, from_square, to_square, BITS.NORMAL);
      } else if (to_piece == null) {
        add_move(me.board, moves, from_square, to_square, BITS.NORMAL);
      }
    } else if (from_piece.type !== 'k') {
      if (to_piece != null && to_piece.color === them) {
        add_move(me.board, moves, from_square, to_square, BITS.CAPTURE);
      } else if (to_piece != null && to_piece.color === us) {
        add_move(me.board, moves, from_square, to_square, BITS.NORMAL);
      } else if (to_piece == null) {
        add_move(me.board, moves, from_square, to_square, BITS.NORMAL);
      }
    } else if (from_piece.type === 'k') {
      let castle = false;
      if (me.castling[us] & BITS.KSIDE_CASTLE) { /* king-side castling */
        let castling_from: number = me.kings[us];
        let castling_to: number = castling_from + 2;
        if (me.board[castling_from + 1] == null &&
          me.board[castling_to] == null &&
          to_square == castling_to) {
          add_move(me.board, moves, me.kings[us], castling_to, BITS.KSIDE_CASTLE);
          castle = true;
        }
      }
      if ((me.castling[us] & BITS.QSIDE_CASTLE) && !castle) { /* queen-side castling */
        let castling_from: number = me.kings[us];
        let castling_to: number = castling_from - 2;
        if (me.board[castling_from - 1] == null &&
          me.board[castling_from - 2] == null &&
          me.board[castling_from - 3] == null &&
          to_square == castling_to) {
          add_move(me.board, moves, me.kings[us], castling_to, BITS.QSIDE_CASTLE);
          castle = true;
        }
      }
      if (!castle) {
        if (to_piece != null && to_piece.color === them) {
          add_move(me.board, moves, from_square, to_square, BITS.CAPTURE);
        } else if (to_piece != null && to_piece.color === us) {
          add_move(me.board, moves, from_square, to_square, BITS.NORMAL);
        } else if (to_piece == null) {
          add_move(me.board, moves, from_square, to_square, BITS.NORMAL);
        }
      }
    }

    me.last_moves = moves;
    let pretty = me.make_pretty(moves[0], true);
    return pretty;
  }

  check_promotion(from_square, target_square) {
    const me = this;
    let us = me.turn;
    let them = me.swap_color(us);
    let first_sq = SQUARES[from_square];
    let last_sq = SQUARES[target_square];
    let to = last_sq;
    let from = first_sq;
    let rank = false;

    if (us == 'w') {
      rank = me.rank(to) === RANK_8
    } else if (us == 'b') {
      rank = me.rank(to) === RANK_1;
    }

    if (me.board[from].type === PAWN && rank) {
      return me.board[from].color;
    }
    return false;
  }

  ///////////////////////////////////// PGN MOVES ///////////////////////////////////////

  load_moves_pgn(pgn, options) {
    const me = this;
    // allow the user to specify the sloppy move parser to work around over
    // disambiguation bugs in Fritz and Chessbase
    let sloppy = (typeof options !== 'undefined' && 'sloppy' in options) ? options.sloppy : false;

    function mask(str) {
      return str.replace(/\\/g, '\\');
    }

    function parse_pgn_header(header, options) {
      let newline_char = (typeof options === 'object' &&
        typeof options.newline_char === 'string') ?
        options.newline_char : '\r?\n';
      let header_obj = {};
      let headers = header.split(new RegExp(mask(newline_char)));
      let key = '';
      let value = '';

      for (let i = 0; i < headers.length; i++) {
        key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
        value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\]$/, '$1');
        if (me.trim(key).length > 0) {
          header_obj[key] = value;
        }
      }

      return header_obj;
    }

    let newline_char = (typeof options === 'object' &&
      typeof options.newline_char === 'string') ?
      options.newline_char : '\r?\n';
    let regex = new RegExp('^(\\[(.|' + mask(newline_char) + ')*\\])' +
      '(' + mask(newline_char) + ')*' +
      '1.(' + mask(newline_char) + '|.)*$', 'g');

    /* get header part of the PGN file */
    let header_string = pgn.replace(regex, '$1');

    /* no info part given, begins with moves */
    if (header_string[0] !== '[') {
      header_string = '';
    }

    me.reset();

    /* parse PGN header */
    let headers = parse_pgn_header(header_string, options);
    for (let key in headers) {
      me.set_header([key, headers[key]]);
    }

    /* load the starting position indicated by [Setup '1'] and
     * [FEN position] */
    /*if (headers['SetUp'] === '1') {
      if (!(('FEN' in headers) && me.load(headers['FEN']))) {
        return false;
      }
    }*/

    /* delete header to get the moves */
    let ms = pgn.replace(header_string, '').replace(new RegExp(mask(newline_char), 'g'), ' ');

    //Save clock moves
    let clkRegex = /(\{\[\%clk [^}]+\})+?/g;
    let clks = [];
    let m;
    while (m = clkRegex.exec(ms)) {
      clks.push(m[1]);
    }

    //Save clock moves
    let movesRegex = /(\{\|[^{\[\]}]+\|\})+?/g;
    let positionMoves = [];
    while (m = movesRegex.exec(ms)) {
      positionMoves.push(m[1]);
    }

    //Save draw offers
    let drawOfferRegex = /(\{draw_offered: [^}]+\})+?/g;
    let drawOffers = [];
    while (m = drawOfferRegex.exec(ms)) {
      const hasDraw = m[1].indexOf('1') != -1 ? true : false;
      drawOffers.push(hasDraw);
    }

    /* delete comments */
    ms = ms.replace(/(\{[^}]+\})+?/g, '');

    /* delete recursive annotation variations */
    let rav_regex = /(\([^\(\)]+\))+?/g
    while (rav_regex.test(ms)) {
      ms = ms.replace(rav_regex, '');
    }

    /* delete move numbers */
    ms = ms.replace(/\d+\.(\.\.)?/g, '');

    /* delete ... indicating black to move */
    ms = ms.replace(/\.\.\./g, '');

    /* delete numeric annotation glyphs */
    ms = ms.replace(/\$\d+/g, '');

    /* delete suffix result*/
    // ms = ms.replace(` ${NO_RESULT}`, '').replace(` ${ON_GOING_GAME}`, '').replace(` ${DRAW_GAME}`, '').replace(` ${BLACK_WON}`, '').replace(` ${WHITE_WON}`, '');

    /* trim and get array of moves */
    let moves = me.trim(ms).split(new RegExp(/\s+/));

    /* delete empty entries */
    moves = moves.join(',').replace(/,,+/g, ',').split(',');
    let moveData;
    let moveClk;
    let drawnOffer;
    let allMoves = [];

    if (moves.length > 0 && positionMoves.length > 0 && clks.length > 0) {
      for (let i = 0; i < moves.length - 1; i++) {
        let san = moves[i];
        let promotion = '';
        san = san.replace(/(.)(?=.*\1)/g, '');
        if (san.indexOf('=') != -1) {
          promotion = san.split('=')[1];
          promotion = promotion.replace(/\+/g, '');
          promotion = promotion.replace(/#/g, '');
          promotion = promotion.toLowerCase();
        }

        moveData = positionMoves[i];
        moveData = moveData.replace(/[\{\|]+[\|\}]/g, '').split('-');
        moveClk = clks[i];
        moveClk = moveClk.replace(/(\{\[\%clk )+/g, '').replace(/(\]\})+/g, '');
        drawnOffer = drawOffers[i];

        const move = {
          san: san,
          from: moveData[0],
          to: moveData[1],
          promotion: promotion,
          clk: moveClk,
          drawnOffer: drawnOffer
        };
        allMoves.push(move);
      }
    }
    return allMoves;
  }

}
