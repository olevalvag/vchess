import {Component} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {Game, LayoutConfig} from "../../utils/utils";

@Component({
  selector: "game-form-tools",
  templateUrl: "game-form-tools.html"
})
export class GameFormTools {

  game: Game;
  layoutConfig: LayoutConfig;
  pgn: string;

  constructor(public viewCtrl: ViewController, public params: NavParams) {
    const me = this;
    me.game = params.get('game');
    me.layoutConfig = params.get('layoutConfig');
    me.pgn = params.get('pgn');
  }

  closeModal() {
    const me = this;
    me.viewCtrl.dismiss();
  }
}
