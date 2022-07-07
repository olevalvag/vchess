import {Component, QueryList, ViewChildren} from "@angular/core";
import {Events, NavParams, ViewController} from "ionic-angular";
import {SignaturePad} from "angular2-signaturepad/signature-pad";
import {BLACK_WON, DRAW_GAME, ON_GOING_GAME, WHITE_WON} from "../../utils/utils";

@Component({
  selector: "register-game",
  templateUrl: "register-game.html"
})
export class RegisterGame {

  // @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChildren(SignaturePad) signaturePads: QueryList<SignaturePad>;
  private gameResult;
  private whiteSignature;
  private blackSignature;
  private whitePad: SignaturePad;
  private blackPad: SignaturePad;

  constructor(public viewCtrl: ViewController, params: NavParams, public events: Events) {
    const me = this;
    me.gameResult = params.get('gameResult');
  }

  /*private signaturePadOptions1: Object = {
    'minWidth': 5,
    'canvasWidth': 400,
    'canvasHeight': 100,
    'name': 'white'
  };*/

  /*private signaturePadOptions2: Object = {
    'minWidth': 5,
    'canvasWidth': 400,
    'canvasHeight': 100,
    'name': 'black'
  };*/

  ngAfterViewInit() {
    const me = this;
    me.signaturePads.forEach((child) => {
      const opt = child.options;
      child.set('minWidth', 5);
      child.clear();
      if (opt['name'] == 'white') me.whitePad = child;
      if (opt['name'] == 'black') me.blackPad = child;
    });
  }

  drawWhiteComplete() {
    const me = this;
    me.whiteSignature = me.whitePad.toDataURL();
  }

  drawBlackComplete() {
    const me = this;
    me.blackSignature = me.blackPad.toDataURL();
  }

  drawStart() {
    console.log('begin drawing');
  }

  isSubmitDisable(): boolean {
    const me = this;
    return me.whiteSignature || me.blackSignature || me.gameResult;
  }

  onSubmitClick() {
    const me = this;
    me.viewCtrl.dismiss({gameResult: me.gameResult});
  }

  onRemoveResult() {
    const me = this;
    me.gameResult = ON_GOING_GAME;
    // me.viewCtrl.dismiss({gameResult: me.gameResult});
  }

  isSelectedBtn(result: string) {
    const me = this;
    let selected = me.parseSelectedResult(result);
    return me.gameResult == selected;
  }

  onResultClick(result: string) {
    const me = this;
    let selected = me.parseSelectedResult(result);
    me.gameResult = selected;
  }

  closeModal() {
    const me = this;
    me.viewCtrl.dismiss();
  }

  private parseSelectedResult(result: string) {
    let selected = ON_GOING_GAME;
    if (result == 'white') {
      selected = WHITE_WON;
    } else if (result == 'black') {
      selected = BLACK_WON;
    } else if (result == 'draw') {
      selected = DRAW_GAME;
    }
    return selected;
  }
}
