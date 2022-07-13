///////////////// Native -----
import {Device} from '@ionic-native/device';
import {Vibration} from "@ionic-native/vibration";
import {NativeAudio} from '@ionic-native/native-audio';
import {Insomnia} from '@ionic-native/insomnia';
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {EmailComposer} from '@ionic-native/email-composer';
import {Clipboard} from '@ionic-native/clipboard';
import {NativeStorage} from '@ionic-native/native-storage';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {AppVersion} from '@ionic-native/app-version';
import {BatteryStatus} from '@ionic-native/battery-status';
import {Brightness} from "@ionic-native/brightness";
import {File} from '@ionic-native/file';
import {Network} from '@ionic-native/network';
import {HTTP} from '@ionic-native/http';
import {NetworkInterface} from '@ionic-native/network-interface';
import {Keyboard} from '@ionic-native/keyboard';
import {GoogleAnalytics} from '@ionic-native/google-analytics';
///////////////// Providers -----
import {MessagesPopup} from "../providers/MessagesPopup";
import {AudioPlayer} from "../providers/audio-player";
import {QuickgameProvider} from "../providers/quicklive/quicklive";
import {QuickGamePgnBackup} from "../providers/quicklive/quick-game-pgn-backup";
import {TournamentProvider} from "../providers/tournament/tournament";
import {TournamentPgnBackup} from "../providers/tournament/tournament-pgn-backup";
import {TournamentPgnUpload} from "../providers/tournament/tournamnet-pgn-upload";
import {QuickgamePgnUpload} from "../providers/quicklive/quickgame-pgn-upload";
import {RangePipe} from "../providers/pipes/range";
import {KeyValuePipe} from "../providers/pipes/key_value";
///////////////// Pages -----
import {MyApp} from "../app/app.component";
import {HomePage} from "../pages/home/home";
import {TableCardMode} from "../pages/table-card-mode/table-card-mode";
import {RecoveryPage} from "../pages/recovery/recovery";
import {AboutPage} from "../pages/about/about";
import {PID_Page} from "../pages/pid/pid";
import {TournamentPage} from "../pages/tournament/tournament";
import {TournamentTableCard} from "../pages/table-card/tournament/tournament-table-card";
import {TournamentResultCard} from "../pages/result-card/tournament/tournament-result-card";
import {QuickGameTableCard} from "../pages/table-card/quick-game/quick-game-table-card";
import {QuickGameResultCard} from "../pages/result-card/quick-game/quick-game-result-card";
import {QuickGamePage} from "../pages/quick-game-page/quick-game-page";
///////////////// Components -----
import {ExtraInfo} from "../components/extra-info/extra-info";
import {Spinner} from "../components/spinner/spinner";
import {BlitzInfo} from "../components/blitz-info/blitz-info";
import {BoardComponent} from "../components/board/board";
import {MoveHistoryComponent} from "../components/move-history/move-history";
import {ClockComponent} from "../components/clock/clock";
import {ClockTemplates} from "../components/clock-templates/clock-templates";
import {DuContact} from "../components/du-contact/du-contact";
import {GameHelp} from "../components/game-help/game-help";
import {PlayerInfo} from "../components/player-info/player-info";
import {GameInfoForm} from "../components/game-info-form/game-info-form";
import {GameFormTools} from "../components/game-form-tool/game-form-tools";
import {FlipLayout} from "../components/flip-layout/flip-layout";
import {TimeControls} from "../components/time_controls/time_controls";
import {Tools} from "../components/tools/tools";
import {PiecePromotion} from "../components/promotion/piece-promotion";
import {QuickGamePgnRecoveryPopup} from "../components/pgn-recovery/quick-games/quick-game-pgn-recovery";
import {RegisterGame} from "../components/register-game/register-game";
import {AppInfo} from "../components/app-info/app-info";
import {EulaComponent} from "../components/eula/eula";
import {TournamentTabletInfo} from "../components/tournament-connect/tournament-tablet-info/tournament-tablet-info";
import {ConnectionListComponent} from "../components/tournament-connect/connection-list/connection-list";
import {TournamentPgnRecoveryPopup} from "../components/pgn-recovery/tournament/tournament-pgn-recovery";
import {TournamentRecovery} from "../components/games-recovery/tournament/tournament-recovery";
import {TournamentResults} from "../components/tournament-results/tournament-results";
import {QuickGameRecovery} from "../components/games-recovery/quick-game/quick-game-recovery";
import {SharePgn} from "../components/share-pgn/share-pgn";
///////////////// Utils -----
import {ChessGame} from "../utils/chess";
import {ClickCounterDirective} from "../providers/directives/click_counter";
///////////////// Native -----
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from "@ionic-native/splash-screen";
///////////////// CORE -----
import {CommonModule} from "@angular/common";
import {ErrorHandler, NgModule} from "@angular/core";
import {IonicErrorHandler, IonicModule} from "ionic-angular";
import {SignaturePadModule} from "angular2-signaturepad";
import {IonicSwipeAllModule} from "ionic-swipe-all";
import {HttpModule} from "@angular/http";
import {BlockCopyPasteDirective} from "../providers/directives/block-copy-paste";
import {OnlyNumbersDirective} from "../providers/directives/only-numbers";


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    SignaturePadModule,
    IonicSwipeAllModule,
    IonicModule
  ],


  declarations: [
    MyApp,
    ExtraInfo,
    BlockCopyPasteDirective,
    OnlyNumbersDirective,
    ClickCounterDirective,
    ClockComponent,
    MoveHistoryComponent,
    BoardComponent,
    BlitzInfo,
    Spinner,
    ClockTemplates,
    HomePage,
    TableCardMode,
    DuContact,
    RecoveryPage,
    PlayerInfo,
    GameInfoForm,
    GameFormTools,
    GameHelp,
    SharePgn,

    FlipLayout,
    AboutPage,
    PID_Page,
    TimeControls,
    TournamentPage,
    Tools,
    PiecePromotion,
    QuickGamePgnRecoveryPopup,
    RegisterGame,
    AppInfo,
    EulaComponent,
    RangePipe,
    KeyValuePipe,
    TournamentTabletInfo,
    ConnectionListComponent,

    // ----------------------TOURNAMENT GAMES
    TournamentPgnRecoveryPopup,
    TournamentRecovery,
    TournamentTableCard,
    TournamentResultCard,
    TournamentResults,

    // ----------------------QUICK GAMES
    QuickGameRecovery,
    QuickGameTableCard,
    QuickGameResultCard,
    QuickGamePage,
  ],


  entryComponents: [
    MyApp,
    ExtraInfo,
    ClockComponent,
    MoveHistoryComponent,
    BoardComponent,
    BlitzInfo,
    Spinner,
    ClockTemplates,
    HomePage,
    TableCardMode,
    DuContact,
    RecoveryPage,
    PlayerInfo,
    GameInfoForm,
    GameFormTools,
    GameHelp,

    FlipLayout,
    AboutPage,
    PID_Page,
    TimeControls,
    TournamentPage,
    Tools,
    PiecePromotion,
    QuickGamePgnRecoveryPopup,
    RegisterGame,
    AppInfo,
    EulaComponent,
    TournamentTabletInfo,
    ConnectionListComponent,

    // ----------------------TOURNAMENT GAMES
    TournamentPgnRecoveryPopup,
    TournamentRecovery,
    TournamentTableCard,
    TournamentResultCard,
    TournamentResults,

    // ----------------------QUICK GAMES
    QuickGameRecovery,
    QuickGameTableCard,
    QuickGameResultCard,
    QuickGamePage,
  ],


  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NativeStorage,
    MessagesPopup,
    AudioPlayer,
    TournamentProvider,
    QuickgameProvider,
    QuickGamePgnBackup,
    TournamentPgnBackup,
    TournamentPgnUpload,
    QuickgamePgnUpload,
    ChessGame,
    ScreenOrientation,
    Insomnia,
    Clipboard,
    EmailComposer,
    Network,
    Keyboard,
    Device,
    Vibration,
    NativeAudio,
    InAppBrowser,
    AppVersion,
    NetworkInterface,
    GoogleAnalytics,
    BatteryStatus,
    AndroidFullScreen,
    Brightness,
    HTTP,
    File
  ],

  exports: [
    MyApp,
    ExtraInfo,
    BlockCopyPasteDirective,
    OnlyNumbersDirective,
    ClickCounterDirective,
    ClockComponent,
    MoveHistoryComponent,
    BoardComponent,
    BlitzInfo,
    Spinner,
    ClockTemplates,
    HomePage,
    TableCardMode,
    DuContact,
    RecoveryPage,
    PlayerInfo,
    GameInfoForm,
    GameFormTools,
    GameHelp,
    SharePgn,

    FlipLayout,
    AboutPage,
    PID_Page,
    TimeControls,
    TournamentPage,
    Tools,
    PiecePromotion,
    QuickGamePgnRecoveryPopup,
    RegisterGame,
    AppInfo,
    EulaComponent,
    RangePipe,
    KeyValuePipe,
    TournamentTabletInfo,
    ConnectionListComponent,

    // ----------------------TOURNAMENT GAMES
    TournamentPgnRecoveryPopup,
    TournamentRecovery,
    TournamentTableCard,
    TournamentResultCard,
    TournamentResults,

    // ----------------------QUICK GAMES
    QuickGameRecovery,
    QuickGameTableCard,
    QuickGameResultCard,
    QuickGamePage,
  ],


})
export class SharedModule {
}
