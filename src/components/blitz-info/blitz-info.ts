import {Component, Input} from "@angular/core";
import {LayoutConfig} from "../../utils/utils";

@Component({
  selector: "blitz-info",
  templateUrl: "blitz-info.html",
})
export class BlitzInfo {

  @Input() whiteCount: number;
  @Input() blackCount: number;
  @Input() layoutConfig: LayoutConfig;

  constructor() {
  }

}
