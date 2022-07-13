import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SharedModule} from "../../../core/shared.module";
import {CommonModule} from "@angular/common";
import {QuickGame__Regular} from "./quick-game-regular";

@NgModule({
  declarations: [
    QuickGame__Regular,
  ],
  entryComponents: [
    QuickGame__Regular,
  ],
  imports: [
    CommonModule,
    SharedModule,
    IonicPageModule.forChild(QuickGame__Regular),
  ],
  exports: [
    QuickGame__Regular
  ]
})
export class QuickGameRegularModule {
}


