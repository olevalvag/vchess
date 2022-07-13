import {Component, Input} from "@angular/core";
import {ToastController} from "ionic-angular";
import {EmailComposer} from '@ionic-native/email-composer';
import {Clipboard} from '@ionic-native/clipboard';
import Utils, {Game, LayoutConfig} from "../../utils/utils";

@Component({
  selector: "share-pgn",
  templateUrl: "share-pgn.html"
})
export class SharePgn {

  @Input() game: Game;
  @Input() layoutConfig: LayoutConfig;
  @Input() pgn: string;
  @Input() showTitle: boolean;
  @Input() isPopup: boolean;

  constructor(public clipboard: Clipboard,
              public toastCtrl: ToastController,
              public emailComposer: EmailComposer) {
    const me = this;
  }

  onCopyClipboardClick() {
    const me = this;
    const publicPGN = Utils.buildPublicPgn(me.game, me.pgn);

    let toast = this.toastCtrl.create({
      duration: 2000,
      message: 'Pgn successfully copied to clipboard.',
      position: 'top'
    });
    me.clipboard.copy(publicPGN);
    toast.present();
  }

  onSendPgnEmailClick() {
    const me = this;
    const publicPGN = Utils.buildPublicPgn(me.game, me.pgn, true);

    let email = {
      subject: 'App - Chess Game Pgn',
      body: publicPGN,
      isHtml: true
    };
    me.emailComposer.open(email);
  }
}
