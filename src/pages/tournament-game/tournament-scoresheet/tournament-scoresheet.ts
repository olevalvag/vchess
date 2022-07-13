import {Component} from '@angular/core';
import {AlertController, Events, IonicPage, ModalController, NavController, NavParams, Platform} from 'ionic-angular';
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {ChessGame} from "../../../utils/chess";
import {ScoreSheetProvider} from "../../../providers/scoreSheet";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {Insomnia} from "@ionic-native/insomnia";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {Brightness} from "@ionic-native/brightness";
import {ScoresheetOnlyBaseGame} from "../../../core/base-game/scoresheet-only/scoresheet-only-base-game";
import {ScoresheetGameState} from "../../../core/chess/game-state/scoresheet-game-state";
import {applyViewMixins, ON_GOING_GAME, WHITE} from "../../../utils/utils";
import {TournamentGameBase} from "../tournament-game-base";
import {TournamentPgnUpload} from "../../../providers/tournament/tournamnet-pgn-upload";
import {TournamentPgnBackup} from "../../../providers/tournament/tournament-pgn-backup";
import {TOURNAMENT__SCORE_SHEET} from "../../../utils/statics";


@IonicPage({name: TOURNAMENT__SCORE_SHEET, segment: TOURNAMENT__SCORE_SHEET})
@Component({
  selector: 'tournament-game-scoresheet',
  templateUrl: '../../../core/base-game/scoresheet-only/scoresheet-only-chess.html',
  providers: [ScoreSheetProvider, Events]
})
export class TournamentScoresheet extends TournamentGameBase {
  constructor(public screenOrientation: ScreenOrientation,
              public insomnia: Insomnia,
              public pgnService: TournamentPgnUpload,
              public pgnBackup: TournamentPgnBackup,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public navParams: NavParams,
              public navCtrl: NavController,
              public chessGame: ChessGame,
              public events: Events,
              public androidFullScreen: AndroidFullScreen,
              public brightness: Brightness,
              public platform: Platform,
              public ga: GoogleAnalytics) {
    super(screenOrientation, insomnia, pgnService, pgnBackup, modalCtrl, alertCtrl, navParams, navCtrl,
      chessGame, events, androidFullScreen, brightness, platform, ga);
    const me = this;
    me.game_state = new ScoresheetGameState(me.chessGame, me.game, me.game.clockSettings, me.events);
  }

  protected get approximateClocksValue() {
    const me = this;
    return 1;
  }

  checkBoardReady() {
    const me = this;
    const game = me.game;
    const result = game.result;
    if (result && result !== ON_GOING_GAME) {
      me.showGameHasResultAlert();
    } else {
      me.initScoresheetOnlyGame();
    }
  }

  protected getActiveClock() {
    const me = this;
    if (me.game_state.clockPaused) return 'Paused';
    return me.game_state.colorToMove() === WHITE ? 'White' : 'Black';
  }

}


///////////// ------------------------------ MIXING ---------------------- ///////////////////////
export interface TournamentScoresheet extends ScoresheetOnlyBaseGame {
}

applyViewMixins(TournamentScoresheet, [ScoresheetOnlyBaseGame]);


