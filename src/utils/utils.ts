import {GameMove} from '../core/chess/GameMove';
import {
  ClockSettings,
  blitz__3_2, blitz__5_0, blitz__5_2, classical__60_30, classical__90_30, classical__90_40_30_30,
  rapid__12_2, rapid__15_0, rapid__25_10, rapid__25_5, rapid__5_5
} from '../core/chess/ClockSettings';
import {BatteryStatusResponse} from '@ionic-native/battery-status';


// ERROR MESSAGES
export const default_error_msg: string = 'Something went wrong. Contact your provider.';
export const invalid_pin_error: string = 'PIN code for tournament is not valid.';
export const no_internet_error: string = 'No server connection. Please check your internet connection';


export const APP_EULA: string = 'app:show_eula';
export const COMMON_HASHTAGS: string = 'app:common_hashtags';

export const TOURNAMENT_GAME_TYPE: string = 'tournament-game';
export const QUICK_GAME_TYPE: string = 'quick-game';

export const CLASSIC_TIME_CONTROL: string = 'Classic';
export const RAPID_TIME_CONTROL: string = 'Rapid';
export const BLITZ_TIME_CONTROL: string = 'Blitz';
export const CUSTOM_TIME_CONTROL: string = 'custom';
export const SCORESHEET_ONLY_TIME_CONTROL: string = 'Scoresheet only';
export const TABLE_CARD_ONLY_TIME_CONTROL: string = 'Table card only';
export const SCORESHEET_WHITE_TIME_CONTROL: string = 'scoresheet_white';
export const SCORESHEET_BLACK_TIME_CONTROL: string = 'scoresheet_black';
export const TIME_CONTROLS = [
  CLASSIC_TIME_CONTROL,
  RAPID_TIME_CONTROL,
  BLITZ_TIME_CONTROL,
  CUSTOM_TIME_CONTROL,
  SCORESHEET_ONLY_TIME_CONTROL,
  TABLE_CARD_ONLY_TIME_CONTROL,
  SCORESHEET_WHITE_TIME_CONTROL,
  SCORESHEET_BLACK_TIME_CONTROL];

export interface BrightnessConfig {
  delay: number;
  saving: number;
  normal: number;
}

export interface SuccessReply {
  outcome: string;
  status: string;
}

export interface ErrorReply {
  status: string;
  outcome: string;
  message: string;
}

export interface Tablet extends SuccessReply {
  tablet_name: string | null;
}

export interface GameData extends SuccessReply {
  game_status: string | null;
}

export interface Tournament extends SuccessReply {
  unique_id: string | null;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  site: string | null;
  arbiter: string | null;
}

export interface PID_PIN extends SuccessReply {
  pin: string;
}

export interface Game extends SuccessReply {
  round: number;
  white_player_name: string;
  black_player_name: string;
  white_player_rating: number;
  black_player_rating: number;
  result: string;
  time_control: string;
  clockSettings: ClockSettings;
  WebserverID: string;
}

export interface TournamentGame extends Game {
  table: number;
  game_id: number;
  group_name: string;
  clock_template_details: string;
}

export interface QuickGame extends Game {
  event: string;
  site: string;
  group: string;
  hashtag: string;
  unique_id: string;
  live: boolean;
  qlid: number;
  cards: boolean;
  white_player_fide_id: number;
  black_player_fide_id: number;
}

export interface QuickLiveGameId extends SuccessReply {
  qlid: number | null;
}

export interface FidePlayerInfo extends SuccessReply {
  full_name: string;
  first_name: string;
  last_name: string;
  fide_id: string;
  rating: string;
}

export interface QuickLiveUpload extends SuccessReply {
  message: string;
}

export interface PgnQuickgameRequestParams {
  tournament_name: string;
  tournament_site: string;
  group_name: string;
  round: number;
  table: number;
  game_hashtag: string;
  white_player_name: string;
  black_player_name: string;
  white_player_fide_id: number;
  black_player_fide_id: number;
  white_player_rating: number;
  black_player_rating: number;
  pgn_data: string;
  white_player_clock: string;
  black_player_clock: string;
  game_status: string;
  active_clock: string;
  number_of_moves: number
}


export const EMPTY_FN = function () {
};
export const QUICK_GAME: string = 'quick-game---';
export const APP_STORAGE: string = 'app---';
export const APP_DIR: string = 'APP';
export const BACKUP_DIR_PATH: string = 'backups';
export const WHITE: string = 'white';
export const BLACK: string = 'black';
export const NEITHER: string = 'neither';
export const UNRECORDED = '...';
export const DASH = '-';
export const WHITE_WON = '1-0';
export const BLACK_WON = '0-1';
export const DRAW_GAME = '0.5-0.5';
export const ON_GOING_GAME = '*';
export const NO_RESULT = 'No result';

export interface PgnVariableData {
  result,
  firstMoveRecorded,
  lastMoveRecorded,
  pgnUpdated,
  currentFEN,
  whiteClock,
  blackClock,
  whiteMoves,
  blackMoves,
  activeClock
}

export interface PgnStructure {
  fixData: {
    event,
    site,
    date,
    group,
    table,
    round,
    time_control,
    white,
    black,
    whiteElo,
    blackElo,
    clockSettings,
  },
  variableData: PgnVariableData,
  moves: string
}

export interface PgnHeaders {
  event: string;
  site: string;
  date: string;
  group: string;
  table: number;
  round: number;
  time_control: string;
  white: string;
  black: string;
  whiteElo: number;
  blackElo: number;
  result: string;
  firstMoveRecorded: string;
  lastMoveRecorded: string;
  whiteMoves: number;
  blackMoves: number;
  currentFEN: string;
  whiteClock: string;
  blackClock: string;
  activeClock: 'White' | 'Black' | 'Paused';
}

export type Move = { from: string; to: string; san: string, san_short?: string, promotion?: string, flags?: string, piece?: string, captured?: string, color?: string };
export type PlayerReady = { ready: boolean; color: string; };
export type LayoutConfig = { swap_sections: boolean; swap_sides: boolean; };
export type ViewConfig = { ping: boolean; tablet: boolean; battery: boolean; showLabels: boolean };
export type PgnConfig = { breakLine?: boolean; gameResult?: string; sloppyNotation?: boolean; };
export type PgnRequestParams = {
  approximate_clocks?: any,
  key?: any,
  pin: any,
  gid: any,
  game_status: string,
  pgn?: string,
  white_clock?: string,
  black_clock?: string,
  number_of_moves: number
};

export type TournamentConfig = { key: string, pin: string; tournament: Tournament; tablet: Tablet; };
// export type TableCard = {key: string, pin: string; tournament: Tournament; tablet: Tablet; game: TournamentGame};


///////////////////////////////////// Tournament Backup Structure
export interface GameEntryBackup extends PgnVariableData {
  timestamp: string;
  moves: string;
}

export interface TournamentGameBackup {
  layoutConfig: LayoutConfig;
  game: TournamentGame;
  tablet: Tablet;
  moves_history: Array<GameEntryBackup>
}

export interface TournamentBackup {
  key: string;
  pin: string;
  tournament: Tournament;
  date_timestamp: string;
  games: Array<TournamentGameBackup>
}

export interface QuickGameBackup {
  key: string;
  date_timestamp: string;
  game: QuickGame;
  layoutConfig: LayoutConfig;
  moves_history: Array<GameEntryBackup>;
}

export interface ScoreSheetLine {
  moveNumber: number;
  whiteMove: GameMove;
  blackMove: GameMove;
}

export type ScoreSheet = Array<ScoreSheetLine>;

export default class Utils {

  static batteryStatus: BatteryStatusResponse;
  static isProductionEnvironment: boolean = true;
  static IP_ADDRESS: string = '';

  static parseResultFromPgn(pgnData): string {
    let match;
    const resultRegex = /(\[Result ")(.*)("])/;
    let result = ON_GOING_GAME;

    if (pgnData) {
      match = pgnData.match(resultRegex);
      result = match[2];
    }

    if (result == NO_RESULT) return ON_GOING_GAME;
    return result;
  }

  static parseDateFromPgn(pgnData): string {
    const me = this;
    let match;
    const resultRegex = /(\[Date ")(.*)("])/;
    let result = me.formatUTCTimestamp(new Date().getTime());

    if (pgnData) {
      match = pgnData.match(resultRegex);
      result = match[2];
    }

    return result;
  }

  static parseMovesFromPgn(pgnData): string {
    const me = this;
    const idx = pgnData.lastIndexOf('\n');
    if (idx != -1) return pgnData.substring(idx);
    return '';
  }

  static parseTimeControlFromPgn(pgnData) {
    let match;
    const regex = /(\[TimeControl ")(.*)("])/;
    let time_control = CLASSIC_TIME_CONTROL;

    if (pgnData) {
      match = pgnData.match(regex);
      time_control = match[2];
    }
    return time_control;
  }

  static buildPublicPgn(game: Game, gamePGN: string, isHtml?): string {
    const me = this;
    const emptyStr = '---';
    const moves = Utils.parseMovesFromPgn(gamePGN).replace(/{.*?}/g, '').replace(/\s+/g, ' ').replace(DRAW_GAME, '1/2-1/2');
    let result = game.result || ON_GOING_GAME;
    if (game.result == DRAW_GAME) result = '1/2-1/2';

    const pgnLine = (txt) => `${txt} ${isHtml ? '<br/>' : '\n'}`;

    let pgn = '';
    pgn += pgnLine(`[Event "${ game['event'] || game['name'] || emptyStr}"]`);
    pgn += pgnLine(`[Site "${game['site'] || emptyStr}"]`);
    pgn += pgnLine(`[Date "${Utils.parseDateFromPgn(gamePGN)}"]`);
    pgn += pgnLine(`[Round "${game.round || emptyStr}"]`);
    pgn += pgnLine(`[White "${game.white_player_name || emptyStr}"]`);
    pgn += pgnLine(`[Black "${game.black_player_name || emptyStr}"]`);
    pgn += pgnLine(`[Result "${result}"]`);
    pgn += pgnLine(`[WhiteElo "${game.white_player_rating || emptyStr}"]`);
    pgn += pgnLine(`[BlackElo "${game.black_player_rating || emptyStr}"]`);
    pgn += pgnLine(`[Group "${game['group_name'] || game['group'] || emptyStr}"]`);
    if (game['table']) {pgn += pgnLine(`[Table "${game['table'] || emptyStr}"]`);}
    pgn += `${isHtml ? '<br/>' : '\n'}`;
    pgn += `${moves}`;

    return pgn;
  }

  static clone<T>(instance: T): T {
    const copy = new (instance.constructor as { new(): T })();
    Object.assign(copy, instance);
    return copy;
  }

  static isString(this: void, x: any): x is string {
    return typeof x === 'string';
  }

  static formatTime(seconds: number): string {
    const me = this;
    seconds = Math.ceil(seconds);
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds / 60) % 60;
    const secs = seconds % 60;
    const time = me.twoDigitsTime(hours) + ':' + me.twoDigitsTime(mins) + ':' + me.twoDigitsTime(secs);
    // if (hours > 0) time += me.twoDigitsTime(hours) + ':';
    // time += me.twoDigitsTime(mins) + ':' + me.twoDigitsTime(secs);
    return time;
  }

  static formatTimePgn(seconds: number): string {
    const me = this;
    seconds = Math.ceil(seconds);
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds / 60) % 60;
    const secs = seconds % 60;
    let time = '';
    time += me.twoDigitsTime(hours) + ':';
    time += me.twoDigitsTime(mins) + ':';
    time += me.twoDigitsTime(secs);
    return time;
  }

  static twoDigitsTime(n: number): string {
    n = Math.round(n);
    if (n >= 0 && n <= 9) return `0${n}`;
    return `${n}`;
  }

  static twoDigits(n: number): string {
    n = Math.round(n);
    if (n >= 0 && n <= 9) {
      return `0${n}`;
    } else {
      return `${n}`;
    }
  }

  static formatDate(date: Date): string {
    const me = this;
    return `${date.getFullYear()}.${me.twoDigits(date.getMonth() + 1)}.${me.twoDigits(date.getDate())}`;
  }

  static formatUTCDate(date: Date): string {
    const me = this;
    return `${date.getUTCFullYear()}.${me.twoDigits(date.getUTCMonth() + 1)}.${me.twoDigits(date.getUTCDate())}`;
  }

  static currentUTCDateStr(): string {
    const now = new Date();
    const utcStr = now.toISOString();
    return utcStr.split('T')[0];
  }

  static formatUTCTime(date: Date): string {
    const me = this;
    return `${me.formatUTCDate(date)} ${me.twoDigits(date.getUTCHours())}:${me.twoDigits(date.getUTCMinutes())}:${me.twoDigits(date.getUTCSeconds())}`;
  }

  static formatUTCTimestamp(timestamp): string {
    const me = this;
    const date = new Date(Number(timestamp));
    const dateStr = `${date.getFullYear()}.${me.twoDigits(date.getMonth() + 1)}.${me.twoDigits(date.getDate())}`;
    const timeStr = `${me.twoDigits(date.getHours())}:${me.twoDigits(date.getMinutes())}:${me.twoDigits(date.getSeconds())}`;
    return `${dateStr}  ${timeStr}`;
  }

  static formatUTCTimeOnly(): string {
    const me = this;
    const date = new Date();
    const timeStr = `${me.twoDigits(date.getHours())}:${me.twoDigits(date.getMinutes())}:00`;
    return `${timeStr}`;
  }

  static formatUtcDateTimestamp(timestamp): string {
    const me = this;
    const date = new Date(Number(timestamp));
    const dateStr = `${date.getFullYear()}.${me.twoDigits(date.getMonth() + 1)}.${me.twoDigits(date.getDate())}`;
    return dateStr;
  }

  static getUTCTimestamp(date: Date): string {
    var utc_timestamp = Date.UTC(date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds());
    return String(utc_timestamp);
  }

  static isJSON(str) {
    try {
      return (JSON.parse(str) && !!str);
    } catch (e) {
      return false;
    }
  }

  static isEmptyString(str) {
    return str.length > 0 ? false : true;
  }

  static checkFinisGameStage(moves) {
    moves = moves.toString();
    const finishGameRex = new RegExp(/^.*?finish.*?game.*?$/gi);
    return finishGameRex.test(moves)
  }

  static opossiteColor(color: string) {
    if (color == WHITE) return BLACK;
    if (color == BLACK) return WHITE;
    return NEITHER;
  }

  static pgnString(pgn: PgnStructure): string {
    const baseInfo = pgn.fixData;
    const variableInfo = pgn.variableData;
    const movesHistory = pgn.moves;
    const lines = [
      `[Event "${baseInfo.event}"]`,
      `[Site "${baseInfo.site}"]`,
      `[Date "${baseInfo.date}"]`,
      `[Group "${baseInfo.group}"]`,
      `[Table "${baseInfo.table}"]`,
      `[Round "${baseInfo.round}"]`,
      `[TimeControl "${baseInfo.time_control}"]`,
      `[White "${baseInfo.white}"]`,
      `[Black "${baseInfo.black}"]`,
      `[WhiteElo "${baseInfo.whiteElo}"]`,
      `[BlackElo "${baseInfo.blackElo}"]`,
      `[ClockSettings "${baseInfo.clockSettings}"]`,
      `[BlackMoves "${variableInfo.blackMoves}"]`,
      `[WhiteMoves "${variableInfo.whiteMoves}"]`,
      `[Result "${variableInfo.result}"]`,
      `[CurrentFEN "${variableInfo.currentFEN}"]`,
      `[FirstMoveRecorded "${variableInfo.firstMoveRecorded}"]`,
      `[LastMoveRecorded "${variableInfo.lastMoveRecorded}"]`,
      `[PGNUpdated "${variableInfo.pgnUpdated}"]`,
      `[WhiteClock "${variableInfo.whiteClock}"]`,
      `[BlackClock "${variableInfo.blackClock}"]`,
      `[ActiveClock "${variableInfo.activeClock}"]`
    ];
    lines.push(movesHistory);
    return lines.join("\n");
  }

  static isBlitzGame(timeControl: string): boolean {
    return timeControl === BLITZ_TIME_CONTROL;
  }

  static isClassicGame(timeControl: string): boolean {
    return timeControl === CLASSIC_TIME_CONTROL;
  }

  static isTableCardOnlyGame(timeControl: string): boolean {
    return timeControl === TABLE_CARD_ONLY_TIME_CONTROL;
  }

  static isRapidGame(timeControl: string): boolean {
    return timeControl === RAPID_TIME_CONTROL;
  }

  static isScoreSheetWhiteGame(timeControl: string): boolean {
    return timeControl === SCORESHEET_WHITE_TIME_CONTROL;
  }

  static isScoreSheetBlackGame(timeControl: string): boolean {
    return timeControl === SCORESHEET_BLACK_TIME_CONTROL;
  }

  static isScoreSheetOnlyGame(timeControl: string): boolean {
    return timeControl === SCORESHEET_ONLY_TIME_CONTROL;
  }

  static isCustomGame(timeControl: string): boolean {
    return timeControl === CUSTOM_TIME_CONTROL;
  }

  static mapTimeControls() {
    let timeControls = {};
    timeControls[CLASSIC_TIME_CONTROL] = 'Classic';
    timeControls[RAPID_TIME_CONTROL] = 'Rapid';
    timeControls[BLITZ_TIME_CONTROL] = 'Blitz';
    timeControls[SCORESHEET_WHITE_TIME_CONTROL] = 'Score-sheet white';
    timeControls[SCORESHEET_BLACK_TIME_CONTROL] = 'Score-sheet black';
    timeControls[SCORESHEET_ONLY_TIME_CONTROL] = 'Scoresheet only';
    timeControls[TABLE_CARD_ONLY_TIME_CONTROL] = 'Table card only';
    timeControls[CUSTOM_TIME_CONTROL] = 'Custom';
    return timeControls;
  }

  static visualTimeControls() {
    let timeControls = [];
    timeControls.push({label: 'Scoresheet only', value: SCORESHEET_ONLY_TIME_CONTROL});
    timeControls.push({label: 'Clocks only', value: BLITZ_TIME_CONTROL});
    timeControls.push({label: 'Clock and notation - Classic', value: CLASSIC_TIME_CONTROL});
    timeControls.push({label: 'Clock and notation - Rapid', value: RAPID_TIME_CONTROL});
    timeControls.push({label: 'Clock and white notation', value: SCORESHEET_WHITE_TIME_CONTROL});
    timeControls.push({label: 'Clock and black notation', value: SCORESHEET_BLACK_TIME_CONTROL});
    return timeControls;
  }

  static mapClockTemplates() {
    return {
      '90-30': classical__90_30,
      '3-2': blitz__3_2,
      '12-3': rapid__12_2,
      '5-0': blitz__5_0,
      '5-2': blitz__5_2,
      '5-5': rapid__5_5,
      '15-0': rapid__15_0,
      '25-5': rapid__25_5,
      '25-10': rapid__25_10,
      '60-30': classical__60_30,
      '90/40+30-30': classical__90_40_30_30,
    };
  }

  static capitalizeWords(str: string): string {
    let name = str.toLowerCase().split(' ');
    for (var i = 0; i < name.length; i++) {
      name[i] = name[i].charAt(0).toUpperCase() + name[i].substring(1);
    }
    return name.join(' ');
  }

  static sendViewTagtoGA(GoogleAnalytics, tag: string): void {
    try {
      GoogleAnalytics.trackView(tag);
    } catch (e) {
      console.log('Error starting GoogleAnalytics', e);
    }
  }

  static sendEventToGA(GoogleAnalytics, category: string, action: string, label: string, value): void {
    try {
      GoogleAnalytics.trackEvent(category || '', action || '', label || '', value);
    } catch (e) {
      console.log("Error with Google Analytics", e);
    }
  }

}

export type Constructor<T = {}> = new (...args: any[]) => T;

export function applyViewMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    if (baseCtor) {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
      });
    }
  });
}
