import {Injectable} from "@angular/core";
import Utils, {
  APP_STORAGE,
  GameEntryBackup,
  LayoutConfig,
  PgnStructure,
  TournamentBackup,
  TournamentConfig,
  TournamentGame,
  TournamentGameBackup
} from "../../utils/utils";
import {NativeStorage} from '@ionic-native/native-storage';


@Injectable()
export class TournamentPgnBackup {

  private tournamentKey: string;
  private gameKey: number;

  private tournamentConfig: TournamentConfig;
  private game: TournamentGame;
  private layoutConfig: LayoutConfig;

  constructor(public storage: NativeStorage) {
  }

  public initialize(game: TournamentGame, tournamentConfig: TournamentConfig, layoutConfig: LayoutConfig) {
    const me = this;
    const tournament = tournamentConfig.tournament;

    me.tournamentConfig = tournamentConfig;
    me.game = game;
    me.layoutConfig = layoutConfig;
    me.tournamentKey = APP_STORAGE + tournament.unique_id;
    me.gameKey = game.game_id;

    me.createTournamentRecord();
  }

  public savePgn(pgn: PgnStructure) {
    const me = this;
    const tournamentKey = me.tournamentKey;
    const gameKey = me.gameKey;
    const tournamentRecord = me.storage.getItem(tournamentKey);

    tournamentRecord.then((tournamentData: TournamentBackup) => {
      let games = tournamentData.games;
      let gameEntry: TournamentGameBackup = games.find((x: TournamentGameBackup) => x.game.game_id == gameKey);
      let exists: boolean = true;

      if (!gameEntry) {
        gameEntry = me.createGameRecord();
        exists = false;
      }
      gameEntry.moves_history.unshift(me.addGameEntry(pgn));
      if (!exists) games.push(gameEntry);

      me.storage.setItem(tournamentKey, tournamentData);
    });
  }

  public updateTournamentGame(newGame) {
    const me = this;
    const tournamentKey = me.tournamentKey;
    const gameKey = me.gameKey;
    const tournamentRecord = me.storage.getItem(tournamentKey);

    tournamentRecord.then((tournamentData: TournamentBackup) => {
      let games = tournamentData.games;
      let gameEntry: TournamentGameBackup = games.find((x: TournamentGameBackup) => x.game.game_id == gameKey);
      if (gameEntry) gameEntry.game = newGame;
      me.storage.setItem(tournamentKey, tournamentData);
    });
  }

  private createTournamentRecord() {
    const me = this;
    const timestamp = Utils.getUTCTimestamp(new Date());
    const tournamentConfig = me.tournamentConfig;
    const tournament = tournamentConfig.tournament;
    const tournamentKey = me.tournamentKey;
    let record: TournamentBackup = {} as TournamentBackup;

    record.tournament = tournament;
    record.pin = tournamentConfig.pin;
    record.key = tournamentConfig.key;
    record.date_timestamp = timestamp;
    record.games = new Array<TournamentGameBackup>();

    me.storage.getItem(tournamentKey).then(item => {
      const data = !item ? record : item;
      me.storage.setItem(tournamentKey, data).then(() => me.updateTournamentGame(me.game));
    }).catch(() => {
      me.storage.setItem(tournamentKey, record)
    });
  }

  private createGameRecord(): TournamentGameBackup {
    const me = this;
    const tournamentConfig = me.tournamentConfig;
    let record: TournamentGameBackup = {} as TournamentGameBackup;

    record.layoutConfig = me.layoutConfig;
    record.tablet = tournamentConfig.tablet;
    record.game = me.game;
    record.moves_history = new Array<GameEntryBackup>();

    delete record.game['pgn_data'];
    return record;
  }

  private addGameEntry(pgn: PgnStructure) {
    let newEntry: GameEntryBackup = {} as GameEntryBackup;
    const currentTimestamp = Utils.getUTCTimestamp(new Date());
    const variableInfo = pgn.variableData;
    const movesHistory = pgn.moves;

    Object.assign(newEntry, variableInfo);
    newEntry.timestamp = currentTimestamp;
    newEntry.moves = movesHistory;
    return newEntry;
  }

}
