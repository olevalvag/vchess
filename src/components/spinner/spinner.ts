import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";

@Component({
  selector: "spinner",
  templateUrl: "spinner.html"
})
export class Spinner implements OnChanges {

  @Input() visible: boolean;
  @Input() message: string;

  constructor() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const me = this;
    let checkVisible = changes['visible'];
    if (checkVisible) me.visible = checkVisible['currentValue'];
  }
}
