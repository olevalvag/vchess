import {Injectable, OnDestroy} from "@angular/core";
import {BLACK, ScoreSheet, ScoreSheetLine, WHITE} from "../utils/utils";
import {Events} from 'ionic-angular';
import {GameMove} from "../core/chess/GameMove";

@Injectable()
export class ScoreSheetProvider implements OnDestroy {

  private scoreSheetList: Array<ScoreSheetLine>;

  private events_subscribed = [
    'score_sheet:refresh_overwrite',
    'score_sheet:refresh',
    'score_sheet:update',
    'score_sheet:add_white_unrecorded',
    'score_sheet:add_black_unrecorded',
    'score_sheet:add_white_dash',
    'score_sheet:add_black_dash',
    'score_sheet:notify',
  ];

  constructor(public events: Events) {
    const me = this;
    me.scoreSheetList = new Array<ScoreSheetLine>();
    me.events.subscribe('score_sheet:refresh_overwrite', (moveHistoryList, idx) => {
      me.overwriteScoreSheetList(moveHistoryList, idx);
    });
    me.events.subscribe('score_sheet:refresh', (moveHistoryList) => me.refreshList(moveHistoryList));
    me.events.subscribe('score_sheet:update', (data) => me.updateList(data));

    me.events.subscribe('score_sheet:add_white_unrecorded', () => me.addUnrecordedWhiteMove());
    me.events.subscribe('score_sheet:add_black_unrecorded', () => me.addUnrecordedBlackMove());
    me.events.subscribe('score_sheet:add_white_dash', () => me.addDashWhiteMove());
    me.events.subscribe('score_sheet:add_black_dash', () => me.addDashBlackMove());
    me.events.subscribe('score_sheet:notify', () => me.notifyUpdatedList());
  }

  ngOnDestroy(): void {
    const me = this;
    me.events_subscribed.forEach(event => {
      me.events.unsubscribe(event);
    });
  }

  public fetchList() {
    const me = this;
    return me.scoreSheetList;
  }

  public addDrawOffer(item, color) {
    const me = this;
    const moveNumber = item.moveNumber;
    let info = me.scoreSheetList[moveNumber - 1];

    if (color == WHITE) {
      info.whiteMove.drawOffer = true;
    } else {
      info.blackMove.drawOffer = true;
    }
    me.notifyUpdatedList();
  }

  public removeDrawOffer(item, color) {
    const me = this;
    const moveNumber = item.moveNumber;
    let info = me.scoreSheetList[moveNumber - 1];

    if (color == WHITE) {
      info.whiteMove.drawOffer = false;
    } else {
      info.blackMove.drawOffer = false;
    }
    me.notifyUpdatedList();
  }

  private notifyUpdatedList() {
    const me = this;
    me.events.publish('score_sheet:updated', me.scoreSheetList);
  }

  private refreshList(moveHistoryList) {
    const me = this;
    me.scoreSheetList = me.getScoreSheetList(moveHistoryList);
    me.notifyUpdatedList();
  }

  private getScoreSheetList(movesHistory: Array<GameMove>): ScoreSheet {
    const result: ScoreSheetLine[] = [];
    const emptyMove = GameMove.createEmpty();
    let i;
    for (i = 0; i < movesHistory.length; i += 2) {
      const moveNumber = 1 + i / 2;
      const whiteMove = movesHistory[i] ? movesHistory[i] : emptyMove;
      const blackMove = movesHistory[i + 1] ? movesHistory[i + 1] : emptyMove;

      result.push({
        moveNumber: moveNumber,
        whiteMove: whiteMove,
        blackMove: blackMove
      });
    }
    return result;
  };

  private overwriteScoreSheetList(newData, idx: number) {
    const me = this;
    me.scoreSheetList.splice(idx - 1);
    me.scoreSheetList = me.scoreSheetList.concat(newData);
    me.notifyUpdatedList();
  };

  private updateList(data) {
    const me = this;

    let moveHistoryList = data.moveHistoryList;
    let idx = data.idx;

    idx--;
    const sheetIdx = Math.floor(idx / 2);
    if (sheetIdx < 0) return;
    if (idx % 2 == 0) {
      me.scoreSheetList[sheetIdx].whiteMove = moveHistoryList[idx];
    } else {
      me.scoreSheetList[sheetIdx].blackMove = moveHistoryList[idx];
    }
    me.notifyUpdatedList();
  }

  private addUnrecordedWhiteMove() {
    const me = this;
    me.scoreSheetList.push({
      moveNumber: me.scoreSheetList.length + 1,
      whiteMove: GameMove.createUnrecorded(WHITE),
      blackMove: GameMove.createEmpty()
    });
    me.notifyUpdatedList();
  }

  private addUnrecordedBlackMove() {
    const me = this;
    me.scoreSheetList[me.scoreSheetList.length - 1].blackMove = GameMove.createUnrecorded(BLACK);
    me.notifyUpdatedList();
  }

  // ----------------------------- DASH ---------------------------------------------

  private addDashWhiteMove() {
    const me = this;
    me.scoreSheetList.push({
      moveNumber: me.scoreSheetList.length + 1,
      whiteMove: GameMove.createDash(WHITE),
      blackMove: GameMove.createEmpty()
    });
    me.events.publish('score_sheet:dash_scroll', me.scoreSheetList);

  }

  private addDashBlackMove() {
    const me = this;
    me.scoreSheetList[me.scoreSheetList.length - 1].blackMove = GameMove.createDash(BLACK);
    me.events.publish('score_sheet:dash_scroll', me.scoreSheetList);

  }

}
