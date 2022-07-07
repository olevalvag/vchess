import {Component} from "@angular/core";
import {ViewController} from "ionic-angular";

@Component({
  selector: "game-help",
  templateUrl: "game-help.html"
})
export class GameHelp {

  cards = [
    {
      code: 'recording_moves',
      title: 'Recording the moves',
      items: [
        'Tap the piece and then tap the destination square',
        'Or, simply drag and drop the piece to its destination square',
      ]
    },
    {
      code: 'correcting_moves',
      title: 'Correcting a move',
      items: [
        'Tap the back arrow till you reach the last correct position',
        'Record the correct move',
        'Confirm that you want to overwrite',
      ]
    },
    {
      code: 'recording_draft',
      title: 'Recording (or removing) a draw offer in the scoresheet',
      items: [
        'In the move list, press and hold for 1-2 seconds on the move in question',
        'Confirm when prompted',
        'To remove the draw offer, press and hold the move in the move list and confirm when promoted',
      ]
    },
    {
      code: 'recording_result',
      title: 'Recording the result',
      items: [
        'Tap the “Pokal” button',
        'Select game result and tap “Submit”',
      ]
    },
    {
      code: 'recording_dash',
      title: 'Inserting a “dash” in the scoresheet',
      items: [
        'Swipe right to left across the move list',
        'The dashes will be replaced by moves when they are recorded',
      ]
    }
  ];

  selectedCard: string;

  constructor(public viewCtrl: ViewController) {}

  public closeModal() {
    const me = this;
    me.viewCtrl.dismiss();
  }

  public onCardClick(code) {
      const me = this;
      if (me.selectedCard === code) {
        me.selectedCard = '';
      } else {
        me.selectedCard = code;
      }
  }

  public getCardIcon(code) {
      const me = this;
    if (me.selectedCard === code) {
      return 'ios-arrow-up';
    }
    return 'ios-arrow-down';
  }

}
