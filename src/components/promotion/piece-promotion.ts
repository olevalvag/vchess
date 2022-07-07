import {Component, ElementRef} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {default as Utils, LayoutConfig} from "../../utils/utils";

@Component({
  selector: "piece-promotion",
  templateUrl: "piece-promotion.html"
})
export class PiecePromotion {

  private selectedPiece: string = '';
  private timeControl: string;
  private color: string = '';
  private layoutConfig: LayoutConfig;

  constructor(public viewCtrl: ViewController,
              public params: NavParams,
              public elementRef: ElementRef) {
    const me = this;
    let elements = me.elementRef.nativeElement;
    me.layoutConfig = params.get('layoutConfig');
    me.timeControl = params.get('timeControl');
    me.color = params.get('color');

    if (!Utils.isScoreSheetOnlyGame(me.timeControl)) {
      if (me.layoutConfig.swap_sides) {
        if (me.color == 'b') elements.style.transform = 'rotate(180deg)';
      } else {
        if (me.color == 'w') elements.style.transform = 'rotate(180deg)';
      }
    }
  }

  onPieceClick(piece: string) {
    const me = this;
    if (piece == 'Q') me.selectedPiece = 'q';
    if (piece == 'N') me.selectedPiece = 'n';
    if (piece == 'R') me.selectedPiece = 'r';
    if (piece == 'B') me.selectedPiece = 'b';
    me.closeModal();
  }

  closeModal() {
    const me = this;
    me.viewCtrl.dismiss(me.selectedPiece);
  }
}
