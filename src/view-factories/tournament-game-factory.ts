import {default as Utils, TournamentGame} from "../utils/utils";
import {TOURNAMENT__REGULAR, TOURNAMENT__SCORE_SHEET} from "../utils/statics";

function tournamentGame_scoresheet() {
  return TOURNAMENT__SCORE_SHEET;
}

function tournamentGame_regular() {
  return TOURNAMENT__REGULAR;
}


export function createTournamentGame(game: TournamentGame): string {
  if (Utils.isScoreSheetOnlyGame(game.time_control)) {
    return tournamentGame_scoresheet();
  }
  return tournamentGame_regular();
}


