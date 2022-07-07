import {Component, ElementRef, ViewChild} from "@angular/core";
import {AlertController, NavParams, ToastController, ViewController} from "ionic-angular";
import Utils, {QuickGameBackup, WHITE} from "../../../utils/utils";
import {Chessground} from "../../../assets/chessground/src/chessground";
import {Config} from "../../../assets/chessground/src/config";
import {Clipboard} from "@ionic-native/clipboard";

@Component({
  selector: "quick-game-pgn-recovery",
  templateUrl: "../recovery-popup.html"
})
export class QuickGamePgnRecoveryPopup {

  @ViewChild("board") public board: ElementRef;
  public selectedTimestamp: string;
  public chessboard: any;
  public renderingBoard: boolean;
  public selectedGame;
  public gameData: QuickGameBackup;

  constructor(public viewCtrl: ViewController,
              public params: NavParams,
              public clipboard: Clipboard,
              public toastCtrl: ToastController,
              public alertCtrl: AlertController,
              public elementRef: ElementRef) {
    const me = this;
    me.gameData = params.get('game') as QuickGameBackup;
    me.renderingBoard = true;
  }

  public ionViewDidLoad(): void {
    const me = this;
    let config = {
      coordinates: false,
      viewOnly: true,
      resizable: true,
    } as Config;

    setTimeout(() => {
      me.renderingBoard = false;
      let elements = me.elementRef.nativeElement;
      let boardCnt = elements.querySelectorAll('.recovery_boardContainer')[0];
      let boardTable = elements.querySelectorAll('.recovery_boardElement')[0];
      if (boardCnt && boardTable) {
        boardTable.style.width = boardCnt.clientWidth + 'px';
        boardTable.style.height = boardCnt.clientWidth + 'px';
        me.chessboard = Chessground(document.getElementById("recovery_board"), config);
      }
    }, 1200);
  }

  closeModal() {
    const me = this;
    me.viewCtrl.dismiss();
  }

  protected onDataClick(game) {
    const me = this;
    const fen = game.currentFEN;
    const timestamp = game['timestamp'];

    me.selectedTimestamp = timestamp;
    me.selectedGame = game;
    if (me.chessboard) me.chessboard.set({fen: fen});
  }

  protected getGameData() {
    const me = this;
    const gameData = me.gameData;
    return gameData ? gameData['moves_history'] : [];
  }

  protected parseGameDate(game) {
    const me = this;
    const timestamp = game['timestamp'];
    return Utils.formatUTCTimestamp(Number(timestamp));
  }

  protected isGameSelected(game) {
    const me = this;
    const timestamp = game['timestamp'];
    return me.selectedTimestamp == timestamp;
  }

  protected onRecoverClick() {
    const me = this;
    me.viewCtrl.dismiss({game_entry: me.selectedGame});
  }

  protected onCopyClipboardClick(selectedGame) {
    const me = this;
    const publicPGN = Utils.buildPublicPgn(me.gameData.game, me.buildPublicPgn(selectedGame));
    let toast = me.toastCtrl.create({
      duration: 2000,
      message: 'Pgn successfully copied to clipboard.',
      position: 'top'
    });
    me.clipboard.copy(publicPGN);
    toast.present();
  }

  protected isBlitzMode(): boolean {
    const me = this;
    const game = me.gameData.game;
    if (!game) return false;

    const timeControl = game.time_control;
    return Utils.isBlitzGame(timeControl);
  }

  protected getPlayerMoves(color) {
    const me = this;
    const game = me.selectedGame;
    if (!game) return 0;
    return color === WHITE ? game.whiteMoves || 0 : game.blackMoves || 0;
  }

  private buildPublicPgn(selectedGame) {
    const me = this;
    const game = me.gameData.game;
    const moves = selectedGame.moves.replace(/(\{[^}]+\} )+?/g, '');

    const pgn =
      `[Event "${game.event || ''}"]
      [Site "${game.site || ''}"]
      [Date "${me.parseGameDate(selectedGame)}"]
      [Round "${game.round || ''}"]
      [White "${game.white_player_name || ''}"]
      [Black "${game.black_player_name || ''}"]
      [WhiteElo "${game.white_player_rating || ''}"]
      [BlackElo "${game.black_player_rating || ''}"]
      [WhiteMoves "${selectedGame.whiteMoves}"]
      [BlackMoves "${selectedGame.blackMoves}"]
      [WhiteClock "${selectedGame.whiteClock}"]
      [BlackClock "${selectedGame.blackClock}"]
      [Result "${selectedGame.result}"]
      [FirstMoveRecorded "${selectedGame.firstMoveRecorded}"]
      [LastMoveRecorded "${selectedGame.lastMoveRecorded}"]
      [CurrentFEN "${selectedGame.currentFEN}"]
      ${moves}`;

    return pgn;
  }
}
