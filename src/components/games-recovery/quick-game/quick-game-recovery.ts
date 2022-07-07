import {Component} from "@angular/core";
import {AlertController, ModalController, NavController, Platform} from "ionic-angular";
import {NativeStorage} from "@ionic-native/native-storage";
import {
  BACKUP_DIR_PATH,
  CLASSIC_TIME_CONTROL,
  APP_DIR,
  default as Utils,
  PgnStructure,
  QUICK_GAME,
  QuickGameBackup
} from "../../../utils/utils";
import {stringifyClockSettings} from "../../../core/chess/ClockSettings";
import {File} from '@ionic-native/file';
import {BaseRecovery} from "../base-recovery";
import {QuickGamePgnRecoveryPopup} from "../../pgn-recovery/quick-games/quick-game-pgn-recovery";
import {createQuickGame} from "../../../view-factories/quickgame-factory";

@Component({
  selector: "quick-game-recovery",
  templateUrl: "quick-game-recovery.html",
})
export class QuickGameRecovery extends BaseRecovery {


  constructor(public navCtrl: NavController,
              public storage: NativeStorage,
              public file: File,
              public platform: Platform,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController) {
    super(storage, file, platform, alertCtrl, modalCtrl);
    const me = this;
    me.keyPrefix = QUICK_GAME;
    me.initialize();
  }

  protected reset(): void {
    const me = this;
    me.gamesRecords = new Array<QuickGameBackup>();
    me.recordCount.emit(0);
  }

  protected checkRecordName(value): boolean {
    const me = this;
    return me.checkSearch(value.game.event);
  }

  protected deleteBackup(gameBackup) {
    const me = this;
    const gameKey = gameBackup.key;
    super.deleteGameStorageBackup(gameKey);
  }

  protected saveToFile(gameBackup: QuickGameBackup) {
    const me = this;
    const gameKey = gameBackup.key;
    const dirPath = `${me.file.externalDataDirectory}${APP_DIR}/${BACKUP_DIR_PATH}`;
    const fileName = `${gameKey}.txt`;
    me.saveGameToFile(dirPath, fileName, gameBackup);
  }

  // SELF --------------------
  protected getGameDate(gameBackup: QuickGameBackup) {
    const me = this;
    const date_timestamp = gameBackup.date_timestamp;
    return Utils.formatUtcDateTimestamp(date_timestamp);
  }

  protected onGameClick(gameBackup: QuickGameBackup) {
    const me = this;
    const viewConfig = {ping: false, tablet: false, battery: true, showLabels: false};

    let popup = me.modalCtrl.create(QuickGamePgnRecoveryPopup,
      {game: gameBackup},
      {enableBackdropDismiss: false});

    popup.onDidDismiss(data => {
      if (!data) return;
      const selectedGame = data['game_entry'];

      gameBackup.game['pgn_data'] = me.createPgnString(gameBackup, selectedGame);
      me.navCtrl.push(createQuickGame(gameBackup.game), {
        game: gameBackup.game,
        layoutConfig: gameBackup.layoutConfig,
        viewConfig: viewConfig
      });
    });
    popup.present();
  }

  protected createPgnString(gameBackup, selectedGame): string {
    const me = this;
    const game = gameBackup.game;
    const clockSettings = stringifyClockSettings(game.clockSettings);

    const pgn: PgnStructure = {
      fixData: {
        event: game.event,
        site: game.site,
        date: Utils.formatUTCTimestamp(gameBackup.date_timestamp),
        group: game.round,
        table: '',
        round: game.round,
        time_control: game.time_control || CLASSIC_TIME_CONTROL,
        white: game.white_player_name,
        black: game.black_player_name,
        whiteElo: game.white_player_rating,
        blackElo: game.black_player_rating,
        clockSettings: clockSettings,
      },
      variableData: {
        result: selectedGame.result,
        firstMoveRecorded: selectedGame.firstMoveRecorded,
        lastMoveRecorded: selectedGame.lastMoveRecorded,
        currentFEN: selectedGame.currentFEN,
        pgnUpdated: selectedGame.pgnUpdated,
        whiteClock: selectedGame.whiteClock,
        blackClock: selectedGame.blackClock,
        whiteMoves: selectedGame.whiteMoves,
        blackMoves: selectedGame.blackMoves,
        activeClock: selectedGame.activeClock,
      },
      moves: selectedGame.moves
    };
    return Utils.pgnString(pgn);
  }

}

