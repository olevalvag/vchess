import {Tablet, Tournament, TournamentGame} from "./utils";

export const PID_KEY: string = 'app:pid_code';
export const FIDE_LOOKUPS: string = 'app:enable_fide_lookups';

export const CONNECTION_SUCCESS_STATUS: string = 'success';
export const CONNECTION_FAIL_STATUS: string = 'fail';
export const CONNECTION_PENDING_STATUS: string = 'pending';
export const CONNECTION_ABORT_STATUS: string = 'abort';

export const ABORT_EVENT: string = 'abort';
export const OK_EVENT: string = 'ok';
export const CHANGE_EVENT: string = 'change';

// ------------------------------------------------------------------- QUICK GAME STORAGE
export const QUICK_GAME__TIME_CONTROL: string = 'app:quick_game__time_control';
export const QUICK_GAME__CLOCK_SETTING: string = 'app:quick_game__clock_setting';


// ------------------------------------------------------------------- GAME VIES PAGES
export const QUICKGAME__SCORE_SHEET: string = 'QUICKGAME__SCORE_SHEET';
export const QUICKGAME__REGULAR: string = 'QUICKGAME__REGULAR';

export const TOURNAMENT__SCORE_SHEET: string = 'TOURNAMENT__SCORE_SHEET';
export const TOURNAMENT__REGULAR: string = 'TOURNAMENT__REGULAR';

export interface InternetConnection {
  visible: boolean;
  status: string;
  data: boolean;
  idx: number;
  attempt: number;
}

export interface TournamentConnection {
  visible: boolean;
  status: string;
  data: Tournament;
  idx: number;
  attempt: number;
  showResponse: boolean;
  requestResponse: string;
}

export interface RegisterTabletConnection {
  visible: boolean;
  status: string;
  data: Tablet;
  idx: number;
  attempt: number;
  showResponse: boolean;
  requestResponse: string;
}

export interface GameConnection {
  visible: boolean;
  status: string;
  data: TournamentGame;
  idx: number;
  attempt: number;
  showResponse: boolean;
  requestResponse: string;
}

export interface ConnectionSteps {
  internet: InternetConnection,
  tournament: TournamentConnection,
  tablet: RegisterTabletConnection,
  game: GameConnection,
}
