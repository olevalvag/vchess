import {Component, EventEmitter, Input, Output} from "@angular/core";
import {PlayerReady} from "../../utils/utils";

@Component({
  selector: "player-info",
  templateUrl: "player-info.html"
})
export class PlayerInfo {

  @Input() public name: string;
  @Input() public club: string;
  @Input() public nationality: string;
  @Input() public rating: string;
  @Input() public showReadyBtn: boolean = true;
  @Input() public status: PlayerReady;
  @Output() public readyChange? = new EventEmitter<any>();

  constructor() {
  }

  public isPlayerReady(): string {
    const me = this;
    const status = me.status;
    return status.ready ? 'secondary' : '';
  }

  public onReadyClick(): void {
    const me = this;
    let status = me.status;
    status.ready = !status.ready;
    me.readyChange.emit();
  }


  protected displayInfo(input: string) {
    return !input || input == 'N/A' ? '' : input;
  }

}
