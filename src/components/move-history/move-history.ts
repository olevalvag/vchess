import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy} from "@angular/core";
import {AlertController, Events} from 'ionic-angular';
import {BLACK, DASH, default as Utils, LayoutConfig, ScoreSheet, WHITE} from "../../utils/utils";
import {ScoreSheetProvider} from "../../providers/scoreSheet";
import {GameMove} from "../../core/chess/GameMove";

@Component({
  selector: "move-history",
  templateUrl: "move-history.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveHistoryComponent implements OnDestroy {

  @Input() readonly timeControl: string;
  @Input() readonly backMoves: Array<GameMove>;
  @Input() readonly layoutConfig: LayoutConfig;
  @Input() readonly color: string;

  private scoreSheet: ScoreSheet;
  private currentWhite: string = '';
  private currentBlack: string = '';
  private currentIdx = 0;

  private events_subscribed = [
    'score_sheet:updated',
    'score_sheet:dash_scroll'
  ];

  constructor(public elementRef: ElementRef,
              public cdr: ChangeDetectorRef,
              public events: Events,
              public alertCtrl: AlertController,
              public scoreSheetProvider: ScoreSheetProvider) {
    const me = this;
    me.scoreSheet = me.scoreSheetProvider.fetchList();
    me.events.subscribe('score_sheet:updated', (scoreSheet) => {
      me.scoreSheet = scoreSheet;
      me.updateScroll();
    });
    me.events.subscribe('score_sheet:dash_scroll', (scoreSheet) => {
      me.scoreSheet = scoreSheet;
      me.updateDashScroll();
    });
  }

  ngOnDestroy(): void {
    const me = this;
    me.events_subscribed.forEach(event => {
      me.events.unsubscribe(event);
    });
  }

  public updateScroll() {
    const me = this;
    const elements = me.elementRef.nativeElement;
    let activeItem;

    me.scoreSheet.forEach((x, i) => {
      if (x.whiteMove.isValidMove || x.blackMove.isValidMove) {
        if (x.whiteMove.active || x.blackMove.active) {
          activeItem = x;
          me.currentIdx = i;
        }
      }
      if (x.whiteMove.isEmptyMove || x.blackMove.isEmptyMove) return;
    });

    // Update scroll
    if (activeItem) {
      const num = activeItem.moveNumber;
      let item = elements.querySelector("span[name='" + num + "']");
      if (item) item.scrollIntoView();
      me.isCurrentMove(activeItem);
    }
    me.cdr.detectChanges();
  }

  public updateDashScroll() {
    const me = this;
    const elements = me.elementRef.nativeElement;
    let activeItem;

    me.scoreSheet.forEach((x, i) => {
      if (x.whiteMove.isDashMove || x.blackMove.isDashMove) {
        activeItem = x;
      }
    });

    // Update scroll
    if (activeItem) {
      const num = activeItem.moveNumber;
      let item = elements.querySelector("span[name='" + num + "']");
      if (item) item.scrollIntoView();
    }
    me.cdr.detectChanges();
  }

  public isCurrentMove(activeItem) {
    const me = this;
    let move;
    let whiteMove = activeItem.whiteMove;
    let blackMove = activeItem.blackMove;

    const whiteUpdate = () => {
      me.currentWhite = whiteMove.position;
      me.currentBlack = '';
      move = whiteMove.move;
      me.events.publish('square_highlight:updated', move);
      me.cdr.detectChanges();
    };
    const blackUpdate = () => {
      me.currentBlack = blackMove.position;
      me.currentWhite = '';
      move = blackMove.move;
      me.events.publish('square_highlight:updated', move);
      me.cdr.detectChanges();
    };

    if (blackMove.active && blackMove.isValidMove) {
      blackUpdate();
    } else if (whiteMove.active && whiteMove.isValidMove) {
      whiteUpdate();
    }
  }

  public isActiveMove(item): boolean {
    return item.active;
  }

  public isSelectedMove(item, idx): boolean {
    const me = this;
    return (item.position == me.currentWhite || item.position == me.currentBlack) && idx == me.currentIdx;
  }

  public hasDrawnOffer(item): string {
    const drawOffer = item.drawOffer;
    return drawOffer ? '=' : '';
  }

  public isDashMove(item): boolean {
    const me = this;
    if (me.isScoresheetOnlyMode() && (item.isUnrecordedMove || item.isDashMove)) {
      return true;
    }
    return false;
  }

  public isVisibleMove(moveNumber = 0, item): boolean {
    const me = this;
    const lastItem = me.scoreSheet[me.scoreSheet.length - 1];
    if (moveNumber == lastItem.moveNumber && item.color == BLACK && lastItem.blackMove.position == DASH) {
      return false
    } else if (moveNumber == lastItem.moveNumber && item.color == WHITE && lastItem.whiteMove.position == DASH && lastItem.blackMove.position == '') {
      return false
    }
    return true;
  }

  public getMovePosition(item): string {
    const me = this;
    const position = item.position;
    return item.getVisualMoveSan || position;
  }

  public onMoveHold(item, color) {
    const me = this;
    const removeDraw = 'Do you want to remove the draw offer from the scoresheet?';
    const addDraw = 'Do you want to register a draw offer in the scoresheet?';
    const move = color == WHITE ? item.whiteMove : item.blackMove;
    const hasDraw = move.drawOffer;
    let cssClass = 'app-alert ';

    if (me.color == WHITE) {
      cssClass += me.layoutConfig.swap_sections ? '' : 'rotate_draw_popup ';
    } else if (me.color == BLACK) {
      cssClass += me.layoutConfig.swap_sections ? 'rotate_draw_popup' : '';
    }

    let alert = me.alertCtrl.create({
      title: 'Draw offered',
      message: !hasDraw ? addDraw : removeDraw,
      cssClass: cssClass,
      enableBackdropDismiss: true,
      buttons: [
        {
          text: 'No',
          cssClass: 'cancel_btn',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          cssClass: 'ok_btn',
          handler: () => {
            if (!hasDraw) {
              me.scoreSheetProvider.addDrawOffer(item, color);
            } else {
              me.scoreSheetProvider.removeDrawOffer(item, color);
            }
            me.cdr.detectChanges();
          }
        },
      ]
    });
    alert.present();
  }

  protected checkScoresheetOnly(): boolean {
    const me = this;
    const swap_sides = me.layoutConfig.swap_sides || false;

    if (swap_sides) {
      if (me.color === WHITE && Utils.isScoreSheetWhiteGame(me.timeControl)) return true;
      if (me.color === BLACK && Utils.isScoreSheetBlackGame(me.timeControl)) return true;
    } else {
      if (me.color === BLACK && Utils.isScoreSheetWhiteGame(me.timeControl)) return true;
      if (me.color === WHITE && Utils.isScoreSheetBlackGame(me.timeControl)) return true;
    }
    return false;
  }

  private isScoresheetOnlyMode(): boolean {
    const me = this;
    const timeControl = me.timeControl;
    return Utils.isScoreSheetOnlyGame(timeControl);
  }

}
