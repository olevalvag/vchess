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
import {ScoresheetOnlyBaseGame} from "../../../core/base-game/scoresheet-only/scoresheet-only-base-game";
import {ScoresheetGameState} from "../../../core/chess/game-state/scoresheet-game-state";
import {applyViewMixins, ON_GOING_GAME, WHITE} from "../../../utils/utils";
import {QuickGameBase} from "../quick-game-base";
import {QUICKGAME__SCORE_SHEET} from "../../../utils/statics";


@IonicPage({name: QUICKGAME__SCORE_SHEET, segment: QUICKGAME__SCORE_SHEET})
@Component({
  selector: 'quick-game-scoresheet-only',
  templateUrl: '../../../core/base-game/scoresheet-only/scoresheet-only-chess.html',
  providers: [ScoreSheetProvider, Events]
})
export class QuickGame__SSO extends QuickGameBase {
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
    me.game_state = new ScoresheetGameState(me.chessGame, me.game, me.game.clockSettings, me.events);
  }

  public checkBoardReady() {
    const me = this;
    const game = me.game;
    const result = game.result;
    if (result && result !== ON_GOING_GAME) {
      me.showGameHasResultAlert();
    } else {
      me.initScoresheetOnlyGame();
    }
  }

  public getActiveClock() {
    const me = this;
    if (me.game_state.clockPaused) return 'Paused';
    return me.game_state.colorToMove() === WHITE ? 'White' : 'Black';
  }

  onShowHiddenClocks() {
    const me = this;
    me.showScoresheetOnlyClocks = !me.showScoresheetOnlyClocks;
  }

}


///////////// ------------------------------ MIXING ---------------------- ///////////////////////
export interface QuickGame__SSO extends ScoresheetOnlyBaseGame {
}

applyViewMixins(QuickGame__SSO, [ScoresheetOnlyBaseGame]);


