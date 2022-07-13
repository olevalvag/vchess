import {Component} from "@angular/core";
import {Events, NavParams, ViewController} from "ionic-angular";
import {BLACK, LayoutConfig, WHITE} from "../../utils/utils";
import {GameMove} from "../../core/chess/GameMove";
import {PlayerState} from "../../core/chess/PlayerState";
import {UI_CONFIG_OPT} from "../../utils/config";

export interface PlayerData {
  hours: number;
  minutes: number;
  seconds: number;
  moves: number;
}

@Component({
  selector: "tools",
  templateUrl: "tools.html"
})
export class Tools {

  public whiteData = {} as PlayerData;
  public blackData = {} as PlayerData;

  public layoutConfig: LayoutConfig;
  public ui_config: UI_CONFIG_OPT;
  private moveHistoryList: Array<GameMove>;
  private white: PlayerState;
  private black: PlayerState;
  private showExit: boolean;

  constructor(public viewCtrl: ViewController, public params: NavParams, public events: Events) {
    const me = this;
    me.white = params.get('white');
    me.black = params.get('black');
    me.moveHistoryList = params.get('movesListHistory');
    me.ui_config = params.get('ui_config');
    me.layoutConfig = params.get('layoutConfig');
    me.showExit = params.get('showExit') || false;
    me.refreshData();
  }

  public on1MinuteClick(color) {
    const me = this;
    if (color == 'white') me.whiteData.minutes += 1;
    if (color == 'black') me.blackData.minutes += 1;
  }

  public on2MinuteClick(color) {
    const me = this;
    if (color == 'white') me.whiteData.minutes += 2;
    if (color == 'black') me.blackData.minutes += 2;
  }

  public getUnrecordedMoves() {
    const me = this;
    const moveHistoryList = me.moveHistoryList;
    let whiteUnrecord = 0;
    let blackUnrecord = 0;
    moveHistoryList.forEach(function (v, i) {
      if (v.isUnrecordedMove || v.isDashMove) {
        if (v.color == WHITE) whiteUnrecord++;
        if (v.color == BLACK) blackUnrecord++;
      }
    });
    return [whiteUnrecord, blackUnrecord];
  }

  public onRemoveMoveClick() {
    const me = this;
    let lastIdx = -1;
    let color = '';
    let i = me.moveHistoryList.length - 1;
    for (i; i >= 0; i--) {
      const move = me.moveHistoryList[i];
      if (move.isUnrecordedMove || move.isDashMove) {
        lastIdx = i;
        color = move.color;
        break;
      }
    }

    if (lastIdx != -1 && color) {
      me.moveHistoryList.splice(lastIdx, 1);
      if (color == WHITE) me.white.removeUnregisteredMove();
      if (color == BLACK) me.black.removeUnregisteredMove();
      me.refreshData();
      me.events.publish('score_sheet:overwrite', me.moveHistoryList);
    }
  }

  closeModal() {
    const me = this;
    me.white.overwriteTime(me.whiteData);
    me.black.overwriteTime(me.blackData);
    me.viewCtrl.dismiss();
  }

  protected onExitClick() {
    const me = this;
    me.viewCtrl.dismiss({exitGame: true});
  }

  private refreshData() {
    const me = this;
    const unregisterMoves = me.getUnrecordedMoves();
    me.parsePlayerClock(me.white, me.whiteData, unregisterMoves[0]);
    me.parsePlayerClock(me.black, me.blackData, unregisterMoves[1]);
  }

  private parsePlayerClock(playerState: PlayerState, playerData: PlayerData, moves: number) {
    const timestamp = playerState.clockTimePgnString;
    let time = timestamp.split(':');
    playerData.hours = Number(time[0]);
    playerData.minutes = Number(time[1]);
    playerData.seconds = Number(time[2]);
    playerData.moves = moves;
  }

}
