import {Component} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {
  blitz__3_2,
  classical__90_30,
  classical__90_40_30_30,
  ClockSettings,
  ClockStage,
  rapid__12_2
} from "../../core/chess/ClockSettings";

@Component({
  selector: "clock-templates",
  templateUrl: "clock-templates.html"
})
export class ClockTemplates {

  incrementTypes: Array<string>;
  manual: boolean;
  stages: any[];
  stagesCount: number;
  classical: ClockSettings = classical__90_40_30_30;
  rapid: ClockSettings = rapid__12_2;
  blitz: ClockSettings = blitz__3_2;
  common: ClockSettings = classical__90_30;

  selectedSettings: ClockSettings;
  selectedName: string;

  constructor(public viewCtrl: ViewController, public params: NavParams) {
    const me = this;
    me.stagesCount = 0;
    me.selectedName = '';
    me.incrementTypes = new Array<string>("fischer");
    me.manual = params.get('customSettings') || false;

    // me.incrementTypes = new Array<string>("fischer", "bronstein", "simple");
  }

  onTemplateClick(name: string) {
    const me = this;
    if (name == 'classical') {
      me.selectedSettings = me.classical;
      me.selectedName = '90/40+30-30';
    }
    if (name == 'blitz') {
      me.selectedSettings = me.blitz;
      me.selectedName = '3-2';
    }
    if (name == 'rapid') {
      me.selectedSettings = me.rapid;
      me.selectedName = '12-3';
    }
    if (name == 'common') {
      me.selectedSettings = me.common;
      me.selectedName = '90-30';
    }
    me.closeModal();
  }

  onManualDoneClick() {
    const me = this;
    let manualSettings: ClockSettings = {
      stages: new Array<ClockStage>()
    };

    for (let i = 0; i < me.stages.length; i++) {
      const stage = me.stages[i];
      const moves = stage.moves ? Number(stage.moves) : Infinity;
      manualSettings.stages.push({
        moves: moves,
        timeInMinutes: Number(stage.timeInMinutes),
        incrementInSeconds: Number(stage.incrementInSeconds),
        incrementType: stage.incrementType
      })
    }
    me.selectedSettings = manualSettings;
    me.selectedName = 'Custom';
    me.closeModal();
  }

  closeModal() {
    const me = this;
    if (me.selectedSettings) {
      me.viewCtrl.dismiss({settings: me.selectedSettings, name: me.selectedName});
    } else {
      me.viewCtrl.dismiss();
    }
  }

  public onStagesChange() {
    const me = this;
    const lgt = Number(me.stagesCount);
    me.stages = [];

    for (let i = 0; i < lgt; i++) {
      me.stages.push({
        moves: '',
        timeInMinutes: '',
        incrementInSeconds: '',
        incrementType: 'fischer'
      })
    }
  }
}
