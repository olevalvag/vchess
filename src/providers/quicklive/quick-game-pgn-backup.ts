import {Injectable} from "@angular/core";
import Utils, {
  GameEntryBackup,
  LayoutConfig,
  PgnStructure,
  QUICK_GAME,
  QuickGame,
  QuickGameBackup,
} from "../../utils/utils";
import {NativeStorage} from '@ionic-native/native-storage';


@Injectable()
export class QuickGamePgnBackup {

  private layoutConfig: LayoutConfig;
  private game: QuickGame;
  private gameId: string;

  constructor(public storage: NativeStorage) {
  }

  public initialize(game: QuickGame, layoutConfig: LayoutConfig) {
    const me = this;

    me.gameId = QUICK_GAME + game['unique_id'];
    me.game = game;
    me.layoutConfig = layoutConfig;
    me.createGameRecord();
  }

  public savePgn(pgn: PgnStructure) {
    const me = this;
    const gameKey = me.gameId;
    const gameRecord = me.storage.getItem(gameKey);

    gameRecord.then((gameData: QuickGameBackup) => {
      gameData.moves_history.unshift(me.addMoveEntry(pgn));
      me.storage.setItem(gameKey, gameData);
    });
  }

  public updatePgnData(game: QuickGame, layoutConfig: LayoutConfig) {
    const me = this;
    const gameKey = me.gameId;
    const gameRecord = me.storage.getItem(gameKey);

    gameRecord.then((gameData: QuickGameBackup) => {
      gameData.game = game;
      gameData.layoutConfig = layoutConfig;
      me.storage.setItem(gameKey, gameData);
    });
  }

  private createGameRecord() {
    const me = this;
    const game = me.game;
    const id = game['unique_id'];
    let record: QuickGameBackup = {} as QuickGameBackup;

    record.key = me.gameId;
    record.game = me.game;
    record.date_timestamp = id;
    record.layoutConfig = me.layoutConfig;
    record.moves_history = new Array<GameEntryBackup>();

    me.storage.getItem(record.key).then(item => {
      me.storage.setItem(record.key, item);
    }).catch(() => {
      me.storage.setItem(record.key, record);
    });
  }

  private addMoveEntry(pgn: PgnStructure) {
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
