import {Component} from "@angular/core";
import {AlertController, ModalController, NavController, Platform} from "ionic-angular";
import {NativeStorage} from "@ionic-native/native-storage";
import {
  BACKUP_DIR_PATH,
  CLASSIC_TIME_CONTROL,
  APP_DIR,
  APP_STORAGE,
  default as Utils,
  LayoutConfig,
  PgnStructure,
  TournamentBackup,
  TournamentConfig,
  TournamentGame,
  TournamentGameBackup,
} from "../../../utils/utils";
import {stringifyClockSettings} from "../../../core/chess/ClockSettings";
import {File} from '@ionic-native/file';
import {TournamentPgnRecoveryPopup} from "../../pgn-recovery/tournament/tournament-pgn-recovery";
import {BaseRecovery} from "../base-recovery";
import {createTournamentGame} from "../../../view-factories/tournament-game-factory";

@Component({
  selector: "tournament-recovery",
  templateUrl: "tournament-recovery.html"
})
export class TournamentRecovery extends BaseRecovery {

  protected expandedCardId;

  constructor(public navCtrl: NavController,
              public storage: NativeStorage,
              public file: File,
              public platform: Platform,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController) {
    super(storage, file, platform, alertCtrl, modalCtrl);
    const me = this;
    me.keyPrefix = APP_STORAGE;
    me.initialize();
  }

  protected reset(): void {
    const me = this;
    me.expandedCardId = null;
    me.gamesRecords = new Array<TournamentBackup>();
    me.recordCount.emit(0);
  }

  protected checkRecordName(value): boolean {
    const me = this;
    return me.checkSearch(value.tournament.name);
  }

  protected deleteBackup(tournamentBackup) {
    const me = this;
    const tournament = tournamentBackup.tournament;
    const tournamentId = tournament.unique_id;
    const tournamentKey = APP_STORAGE + tournamentId;
    super.deleteGameStorageBackup(tournamentKey);
  }

  protected saveToFile(gameBackup) {
    const me = this;
    const tournament = gameBackup.tournament;
    const tournamentId = tournament.unique_id;
    const tournamentKey = APP_STORAGE + tournamentId;
    const dirPath = `${me.file.externalDataDirectory}${APP_DIR}/${BACKUP_DIR_PATH}`;
    const fileName = `${tournamentKey}.txt`;
    me.saveGameToFile(dirPath, fileName, gameBackup);
  }


  // ------------ SELF
  protected getCardIcon(tournamentBackup: TournamentBackup) {
    const me = this;
    const tournament = tournamentBackup.tournament;
    const tournamentId = tournament.unique_id;
    const isSame = me.expandedCardId == tournamentId;

    return isSame ? 'ios-folder-open' : 'md-folder';
  }

  protected onExpandCardClick(tournamentBackup: TournamentBackup) {
    const me = this;
    const tournament = tournamentBackup.tournament;
    const tournamentId = tournament.unique_id;

    const isSame = me.expandedCardId == tournamentId;
    me.expandedCardId = isSame ? null : tournamentId;
  }

  protected onGameClick(tournamentBackup: TournamentBackup, backupGame: TournamentGameBackup) {
    const me = this;
    const defaultLayoutConfig: LayoutConfig = {swap_sections: false, swap_sides: false};

    let popup = me.modalCtrl.create(TournamentPgnRecoveryPopup,
      {tournament: tournamentBackup, game: backupGame},
      {enableBackdropDismiss: false});

    popup.onDidDismiss(data => {
      if (!data) return;
      const selectedGame = data['game_entry'];

      let game: TournamentGame;
      let tournamentConfig: TournamentConfig = {} as TournamentConfig;
      game = backupGame.game;
      tournamentConfig.tablet = backupGame.tablet;
      tournamentConfig.tournament = tournamentBackup.tournament;
      tournamentConfig.pin = tournamentBackup.pin;
      tournamentConfig.key = tournamentBackup.key;
      game['pgn_data'] = me.createPgnString(tournamentConfig, game, selectedGame);
      me.navCtrl.push(createTournamentGame(game), {
        game: game,
        tournamentConfig: tournamentConfig,
        layoutConfig: backupGame.layoutConfig || defaultLayoutConfig
      });
    });
    popup.present();
  }

  private createPgnString(tournamentConfig: TournamentConfig, game, selectedGame): string {
    const me = this;
    const clockSettings = stringifyClockSettings(game.clockSettings);
    const tournament = tournamentConfig.tournament;
    const pgn: PgnStructure = {
      fixData: {
        event: tournament.name,
        site: tournament.site,
        date: tournament.start_date.split('-').join('.'),
        group: game.group_name,
        table: game.table,
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
        activeClock: selectedGame.activeClock
      },
      moves: selectedGame.moves
    };
    return Utils.pgnString(pgn);
  }

}
