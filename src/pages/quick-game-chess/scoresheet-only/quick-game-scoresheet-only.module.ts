import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SharedModule} from "../../../core/shared.module";
import {QuickGame__SSO} from "./quick-game-scoresheet-only";
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [
    QuickGame__SSO,
  ],
  entryComponents: [
    QuickGame__SSO,
  ],
  imports: [
    CommonModule,
    SharedModule,
    IonicPageModule.forChild(QuickGame__SSO),
  ],
  exports: [
    QuickGame__SSO
  ]
})
export class QuickGameScoresheetOnlyModule {
}


