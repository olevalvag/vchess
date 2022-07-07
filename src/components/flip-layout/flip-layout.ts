import {Component, Input} from "@angular/core";
import {LayoutConfig} from "../../utils/utils";

@Component({
  selector: "flip-layout",
  templateUrl: "flip-layout.html"
})
export class FlipLayout {

  @Input() public layoutConfig: LayoutConfig;

  constructor() {
  }

}
