import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import {AlertController, Events, ModalController} from 'ionic-angular';
import {Chessground} from '../../assets/chessground/src/chessground';
import {Config} from '../../assets/chessground/src/config';
import {BLACK, default as Utils, LayoutConfig, Move, NEITHER, WHITE} from "../../utils/utils";
import {ChessGame} from "../../utils/chess";
import {PiecePromotion} from "../promotion/piece-promotion";

export type OverwriteData = { showConfirmation: boolean; movesCount: number; toMove: string };

@Component({
  selector: "board",
  templateUrl: "board.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit, OnChanges {

  @Input() readonly timeControl: string;
  @Input() public layoutConfig: LayoutConfig;
  @Input() public toMove: string;
  @Input() public clockPaused: boolean;
  @Output() public pieceDropped = new EventEmitter<Move>();
  @ViewChild("board") public board: ElementRef;

  public renderingBoard: boolean;
  public chessboard: any;
  private parsed_fen: string;
  private old_fen: string;
  private overwriteData: OverwriteData;

  private events_subscribed = [
    'square_highlight:updated',
    'chess_game:overwrite',
    'chess_game:remake',
    'chessboard:refresh',
    'chessboard:back_move',
    'chessboard:forward_move',
  ];

  constructor(public elementRef: ElementRef,
              public cdr: ChangeDetectorRef,
              public events: Events,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController,
              public chessGame: ChessGame) {
    const me = this;
    me.renderingBoard = true;
    me.overwriteData = {
      showConfirmation: true,
      movesCount: 0,
      toMove: NEITHER
    };

    me.events.subscribe('square_highlight:updated', (move) => {
      if (me.chessboard) me.chessboard.set({lastMove: [move['from'], move['to']]});
    });

    me.events.subscribe('chess_game:overwrite', fen => {
      if (me.chessboard) me.chessboard.set({fen: fen})
    });

    me.events.subscribe('chess_game:remake', fen => {
      me.parsed_fen = fen;
      if (me.chessboard) me.updateFen(fen);
    });

    me.events.subscribe('chessboard:refresh', data => {
      if (me.chessboard) me.updateBoard();
    });

    me.events.subscribe('chessboard:back_move', () => {
      if (me.chessboard) {
        me.overwriteData.movesCount += 1;
        me.overwriteData.showConfirmation = true;
        me.updateOverwriteLogic();
      }
    });

    me.events.subscribe('chessboard:forward_move', () => {
      if (me.chessboard) {
        const count = me.overwriteData.movesCount;
        me.overwriteData.movesCount = Math.max(0, count - 1);
        me.overwriteData.showConfirmation = true;
        me.updateOverwriteLogic();
      }
    });

    me.events.subscribe('chessboard:init_board', () => me.renderBoard());
  }

  public ngOnInit() {
  }

  ngOnDestroy(): void {
    const me = this;
    me.events_subscribed.forEach(event => {
      me.events.unsubscribe(event);
    });
  }

  //TODO  Not the cleanest solution, but the only one to work in slow devices
  private renderBoard(): void {
    const me = this;
    const config = {
      resizable: true,
      coordinates: false,
      orientation: me.layoutConfig.swap_sides ? 'white' : 'black',
      pieceKey: true,
      lastMove: [],
      draggable: {
        enabled: true
      },
      animation: {
        enabled: false,
        duration: 0
      },
      movable: {
        rookCastle: true,
      },
      premovable: {
        enabled: false,
      },
      events: {
        move(source: string, target: string) {
          me.onDropPiece(source, target);
        }
      }
    } as Config;

    setTimeout(() => {
      me.renderingBoard = false;
      me.cdr.detectChanges();
      renderBoard();
    }, 2000);

    const renderBoard = () => {
      setTimeout(() => {
        me.renderingBoard = false;
        let elements = me.elementRef.nativeElement;
        let boardCnt = elements.querySelectorAll('.boardContainer')[0];
        let boardElement = elements.querySelectorAll('.boardElement')[0];
        boardElement.style.width = boardCnt.clientWidth + 'px';
        boardElement.style.height = boardCnt.clientWidth + 'px';
        me.cdr.detectChanges();

        me.chessboard = Chessground(document.getElementById("board"), config);
        me.cdr.detectChanges();


        me.old_fen = me.chessboard.getFen();
        if (me.parsed_fen) me.updateFen(me.parsed_fen);
        me.events.publish('chessboard:board_ready', true);
        setTimeout(() => me.updateBoard(), 100);
      }, 500);
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const me = this;
    let checkMove = changes['toMove'];

    if (checkMove) me.overwriteData.toMove = checkMove['currentValue'];
    me.updateOverwriteLogic();
    me.updateBoard();
    me.cdr.detectChanges();
  }

  protected checkScoresheetGame(color: string): boolean {
    const me = this;
    if (color === WHITE && Utils.isScoreSheetWhiteGame(me.timeControl)) return true;
    if (color === BLACK && Utils.isScoreSheetBlackGame(me.timeControl)) return true;
    return false;
  }

  protected checkScoresheetOnly(): boolean {
    const me = this;
    if (Utils.isScoreSheetOnlyGame(me.timeControl)) return true;
    return false;
  }

  private updateBoard(newSelected?): void {
    const me = this;
    const options = {
      orientation: me.layoutConfig.swap_sides ? "white" : "black",
      movable: {color: me.toMove},
      turnColor: me.toMove,
    };
    if (me.chessboard) {
      if (newSelected) options['selected'] = newSelected;
      me.chessboard.set(options);
    }
    me.cdr.detectChanges();
  }

  private updateFen(fen) {
    const me = this;
    me.chessboard.set({fen: fen});
    me.old_fen = me.chessboard.getFen();
  }

  private updateOverwriteLogic() {
    const me = this;
    let count = me.overwriteData.movesCount;

    me.toMove = NEITHER;
    if (me.clockPaused && count > 0) me.toMove = me.overwriteData.toMove;
    if (!me.clockPaused) me.toMove = me.overwriteData.toMove;
    if (count == 0) me.overwriteData.showConfirmation = true;
  }

  private moveSuccess(move) {
    const me = this;
    me.updateOverwriteLogic();
    me.pieceDropped.emit(move);
    me.updateChess(move);
    me.updateBoard();
    me.old_fen = me.chessboard.getFen();
  }

  private moveCancel(move) {
    const me = this;
    const captured = move['captured'];
    const source = move['to'];
    const target = move['from'];
    const piece = move['promotion'] || move['piece'];

    me.chessGame.remove(source);
    me.chessGame.put({type: piece, color: move['color']}, target);
    if (captured) me.chessGame.put({type: captured, color: me.chessGame.oppositeColor(move['color'])}, source);
    me.chessboard.set({fen: me.chessGame.get_fen(), lastMove: []});
    me.updateBoard();
  }

  private updateChess(move) {
    const me = this;
    const source = move['from'];
    const target = move['to'];
    const piece = move['promotion'] || move['piece'];
    me.chessGame.remove(source);
    me.chessGame.put({type: piece, color: move['color']}, target);
    me.chessboard.set({fen: me.chessGame.get_fen()});
  }

  private checkSameColorSelect(source, target) {
    const me = this;
    const toPosition = me.chessGame.get(source);
    const fromPosition = me.chessGame.get(target);
    const options = {
      selected: target,
      fen: me.old_fen,
      lastMove: [],
      movable: {
        color: me.toMove
      },
      turnColor: me.toMove,
    };

    if (toPosition && fromPosition && toPosition.color == fromPosition.color) {
      me.chessboard.set(options);
      return true;
    }
    return false;
  }

  private onDropPiece(source: string, target: string): void {
    const me = this;
    const backMoveTotal = me.overwriteData.movesCount;

    if (me.checkSameColorSelect(source, target)) return;

    const promotion = me.chessGame.check_promotion(source, target);

    if (promotion) {
      me.showPromotionPopup(promotion, source, target);
      return;
    }

    const move = me.chessGame.board_move(source, target);
    if (!move) return;

    if (backMoveTotal > 0) {
      me.overwriteMove(move, () => me.moveSuccess(move));
    } else {
      me.overwriteData.movesCount = 0;
      me.moveSuccess(move);
    }
  }

  private showPromotionPopup(promotionColor, source, target) {
    const me = this;
    let backMoveTotal = me.overwriteData.movesCount;

    let popup = me.modalCtrl.create(PiecePromotion,
      {color: promotionColor, layoutConfig: me.layoutConfig, timeControl: me.timeControl},
      {enableBackdropDismiss: false});

    if (backMoveTotal > 0) {
      const aux_move = me.chessGame.build_promotion_premove(source, target);
      me.overwriteMove(aux_move, () => popup.present());
    } else {
      popup.present();
    }

    popup.onDidDismiss(selectedPiece => {
      const move = me.chessGame.board_move(source, target, selectedPiece);
      if (move) me.moveSuccess(move);
    });
  }

  private overwriteMove(move, successCallback) {
    const me = this;
    const layoutConfig = me.layoutConfig;
    const overwriteData = me.overwriteData;
    let cssClass = 'app-alert ';

    if (!Utils.isScoreSheetOnlyGame(me.timeControl)) {
      cssClass += layoutConfig.swap_sections ? 'overwrite-alert-fliped' : 'overwrite-alert';
    }

    const success = () => {
      me.overwriteData.movesCount = Math.max(0, overwriteData.movesCount - 1);
      me.overwriteData.showConfirmation = false;
    };

    if (overwriteData.showConfirmation) {
      let confirm = me.alertCtrl.create({
        title: 'Overwrite moves?',
        message: 'Changing this move will delete all forward moves.',
        cssClass: cssClass,
        enableBackdropDismiss: false,
        buttons: [
          {
            cssClass: 'cancel_btn',
            text: 'No',
            handler: () => {
              if (move) me.moveCancel(move);
            }
          },
          {
            text: 'Yes',
            cssClass: 'ok_btn',
            handler: () => {
              setTimeout(() => {
                success();
                successCallback();
              }, 50);
            }
          }
        ]
      });
      confirm.present();
    } else {
      success();
      successCallback();
    }
  }

  public get isScoresheetOnly(): boolean {
    const me = this;
    return Utils.isScoreSheetOnlyGame(me.timeControl);
  }

  /*private rotatePieces() {
    const me = this;
    const config = me.layoutConfig;
    const rotate = (pieces) => {
      for (var i = 0; i < pieces.length; i++) {
        let piece = pieces[i];
        let trans = piece.style.transform.split(') ');
        trans = trans.length == 1 ? trans[0] : trans[0] + ')';
        piece.style.transform = trans + ' rotate(180deg)';
      }
    };
    let elements = me.elementRef.nativeElement;
    let blackPieces = elements.querySelectorAll('.black');
    let whitePieces = elements.querySelectorAll('.white');

    if (config.swap_sides) {
      rotate(blackPieces);
    } else {
      rotate(whitePieces);
    }
  }*/

}
