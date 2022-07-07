import {Component} from '@angular/core';
import {AlertController, Events, IonicPage, ModalController, NavController, NavParams, Platform} from 'ionic-angular';
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {ChessGame} from "../../../utils/chess";
import {ScoreSheetProvider} from "../../../providers/scoreSheet";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {Insomnia} from "@ionic-native/insomnia";
import {GoogleAnalytics} from '@ionic-native/google-analytics';
import {Brightness} from "@ionic-native/brightness";
import {TournamentGameBase} from "../tournament-game-base";
import {TournamentPgnUpload} from "../../../providers/tournament/tournamnet-pgn-upload";
import {TournamentPgnBackup} from "../../../providers/tournament/tournament-pgn-backup";
import {TOURNAMENT__REGULAR} from "../../../utils/statics";
import {BaseGameState} from "../../../core/chess/game-state/base-game-state";


@IonicPage({name: TOURNAMENT__REGULAR, segment: TOURNAMENT__REGULAR})
@Component({
  selector: 'tournament-game',
  templateUrl: '../../../core/base-game/base-game.html',
  providers: [ScoreSheetProvider, Events]
})
export class TournamentRegular extends TournamentGameBase {
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
    me.game_state = new BaseGameState(me.chessGame, me.game, me.game.clockSettings, me.events);
  }

}
