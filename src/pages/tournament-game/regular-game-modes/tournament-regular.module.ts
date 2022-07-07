import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SharedModule} from "../../../core/shared.module";
import {CommonModule} from "@angular/common";
import {TournamentRegular} from "./tournament-regular";

@NgModule({
  declarations: [
    TournamentRegular,
  ],
  entryComponents: [
    TournamentRegular,
  ],
  imports: [
    CommonModule,
    SharedModule,
    IonicPageModule.forChild(TournamentRegular),
  ],
  exports: [
    TournamentRegular
  ]
})
export class TournamentRegularModule {
}


