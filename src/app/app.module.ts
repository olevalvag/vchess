////////////////// Ionic/Angular -----
import {enableProdMode, NgModule} from '@angular/core';
import {IonicApp, IonicModule} from 'ionic-angular';
///////////////// Pages -----
import {MyApp} from "./app.component";
///////////////// Utils -----
import {CommonModule} from "@angular/common";
import {SharedModule} from "../core/shared.module";
import {BrowserModule} from "@angular/platform-browser";

enableProdMode();

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    IonicModule.forRoot(MyApp, {
      scrollPadding: true,
      scrollAssist: true,
      autoFocusAssist: true
    }),
  ],
  declarations: [],
  entryComponents: [],
  bootstrap: [IonicApp],
})
export class AppModule {
}
