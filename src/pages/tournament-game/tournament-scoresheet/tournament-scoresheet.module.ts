import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SharedModule} from "../../../core/shared.module";
import {CommonModule} from "@angular/common";
import {TournamentScoresheet} from "./tournament-scoresheet";

@NgModule({
  declarations: [
    TournamentScoresheet,
  ],
  entryComponents: [
    TournamentScoresheet,
  ],
  imports: [
    CommonModule,
    SharedModule,
    IonicPageModule.forChild(TournamentScoresheet),
  ],
  exports: [
    TournamentScoresheet
  ]
})
export class TournamentScoresheetModule {
}


