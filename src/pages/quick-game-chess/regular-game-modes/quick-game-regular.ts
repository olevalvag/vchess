import {ChangeDetectorRef, Component} from '@angular/core';
import {AlertController, Events, IonicPage, ModalController, NavController, NavParams, Platform} from 'ionic-angular';
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {ChessGame} from "../../../utils/chess";
import {ScoreSheetProvider} from "../../../providers/scoreSheet";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {Insomnia} from "@ionic-native/insomnia";
import {QuickGamePgnBackup} from "../../../providers/quicklive/quick-game-pgn-backup";
import {QuickgamePgnUpload} from "../../../providers/quicklive/quickgame-pgn-upload";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {Brightness} from "@ionic-native/brightness";
import {QuickGameBase} from "../quick-game-base";
import {BaseGameState} from "../../../core/chess/game-state/base-game-state";
import {QUICKGAME__REGULAR} from "../../../utils/statics";


@IonicPage({name: QUICKGAME__REGULAR, segment: QUICKGAME__REGULAR})
@Component({
  selector: 'quick-game-regular',
  templateUrl: '../../../core/base-game/base-game.html',
  providers: [ScoreSheetProvider, Events]
})
export class QuickGame__Regular extends QuickGameBase {
  constructor(public screenOrientation: ScreenOrientation,
              public insomnia: Insomnia,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public chessGame: ChessGame,
              public events: Events,
              public androidFullScreen: AndroidFullScreen,
              public platform: Platform,
              public brightness: Brightness,
              public pgnUploadService: QuickgamePgnUpload,
              public pgnBackup: QuickGamePgnBackup,
              public navParams: NavParams,
              public cdr: ChangeDetectorRef,
              public ga: GoogleAnalytics) {
    super(screenOrientation, insomnia, modalCtrl, alertCtrl, navCtrl, chessGame, events, androidFullScreen, platform, brightness, pgnUploadService, pgnBackup, navParams, cdr, ga);
    const me = this;
    me.game_state = new BaseGameState(me.chessGame, me.game, me.game.clockSettings, me.events);
    me.ui_config.buttons.exit = true;
  }
}

