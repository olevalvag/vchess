import {Component, Input, OnInit} from "@angular/core";
import {default as Utils, ViewConfig} from "../../utils/utils";
import {PingService} from "../../providers/ping";

@Component({
  selector: "extra-info",
  templateUrl: "extra-info.html",
  providers: [PingService]
})
export class ExtraInfo implements OnInit {

  public pingLatency: string;
  @Input() tabletName: string;
  @Input() viewConfig: ViewConfig;

  constructor(public pingService: PingService) {
    const me = this;
    me.viewConfig = {ping: false, tablet: false, battery: false, showLabels: false};
  }

  ngOnInit() {
    const me = this;
    let config = me.viewConfig;
    if (config.ping) {
      me.pingService.initPing();
      me.pingService.pingStream.subscribe(ping => me.pingLatency = ping);
    }
  }

  public ngOnDestroy(): void {
    const me = this;
    me.pingService.pingStream.unsubscribe();
    me.pingService.removePingCheck();
  }

  protected getBatteryLevel() {
    const battery = Utils.batteryStatus;
    if (battery) return battery.level;
    return 0;
  }

  protected getPingValue() {
    const me = this;
    if (me.pingLatency) return me.pingLatency;
    return 0;
  }

  protected getTabletName(): string {
    const me = this;
    return me.tabletName || '';
  }
}
