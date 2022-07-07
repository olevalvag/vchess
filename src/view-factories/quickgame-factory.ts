import Utils, {QuickGame} from "../utils/utils";
import {QUICKGAME__REGULAR, QUICKGAME__SCORE_SHEET} from "../utils/statics";

export function quickGame_scoresheet() {
  return QUICKGAME__SCORE_SHEET;
  // return QuickGame__SSO;
}

export function quickGame_regular() {
  return QUICKGAME__REGULAR;
  // return QuickGame__Regular;
}


export function createQuickGame(game: QuickGame): string {
  if (Utils.isScoreSheetOnlyGame(game.time_control)) {
    return quickGame_scoresheet();
  }
  return quickGame_regular();
}


