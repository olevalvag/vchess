import {Component} from "@angular/core";
import {ViewController} from "ionic-angular";

@Component({
  selector: "du-contact",
  templateUrl: "du-contact.html"
})
export class DuContact {

  constructor(public viewCtrl: ViewController) {
  }

  onCvClick() {
    let url = "https://drive.google.com";
    window.open(encodeURI(url), '_system', 'location=yes');
  }

  closeModal() {
    const me = this;
    me.viewCtrl.dismiss();
  }
}
