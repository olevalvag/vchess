import {Component} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: "tournament-results",
  templateUrl: "tournament-results.html"
})
export class TournamentResults {

  protected loading: boolean = true;
  private url: any;
  private webServerId: string;
  private round: string;
  private group_name: string;

  constructor(public viewCtrl: ViewController, public sanitizer: DomSanitizer, public params: NavParams) {
  }

  ngOnInit() {
    const me = this;
    me.webServerId = me.params.get('webServerId');
    me.round = me.params.get('round');
    me.group_name = me.params.get('group_name');
    me.tournamentURL();
  }

  closeModal() {
    const me = this;
    me.viewCtrl.dismiss();
  }

  protected onIframeDone() {
    const me = this;
    me.loading = false;
  }

  private tournamentURL() {
    const me = this;
    const url = `http://tournamentservice.com/standings.aspx?TID=${me.webServerId}&group=${me.group_name}&mini=y`;
    me.url = me.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
