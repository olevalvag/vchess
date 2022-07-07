import {Component, ElementRef, ViewChild} from "@angular/core";
import {AlertController, NavParams, ToastController, ViewController} from "ionic-angular";
import Utils, {TournamentBackup, TournamentGameBackup, WHITE} from "../../../utils/utils";
import {Chessground} from "../../../assets/chessground/src/chessground";
import {Config} from "../../../assets/chessground/src/config";
import {Clipboard} from "@ionic-native/clipboard";

@Component({
  selector: "tournament-pgn-recovery",
  templateUrl: "../recovery-popup.html",
})
export class TournamentPgnRecoveryPopup {

  @ViewChild("board") public board: ElementRef;
  public selectedTimestamp: string;
  public chessboard: any;
  public renderingBoard: boolean;
  public gameKey;
  public selectedGame;
  public tournamentData: TournamentBackup;
  public gameData: TournamentGameBackup;

  constructor(public viewCtrl: ViewController,
              public params: NavParams,
              public clipboard: Clipboard,
              public toastCtrl: ToastController,
              public alertCtrl: AlertController,
              public elementRef: ElementRef) {
    const me = this;
    let tournamentGame = params.get('game') as TournamentGameBackup;
    me.tournamentData = params.get('tournament') as TournamentBackup;
    me.renderingBoard = true;
    me.gameData = tournamentGame;
    me.gameKey = tournamentGame.game.game_id;
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

  protected onRecoverClick(opts?) {
    const me = this;
    const pin = me.tournamentData.pin;
    let title = 'Password needed.';
    let cssClass = 'app-alert overwrite_modal_bg ';

    if (opts) {
      title = opts.title || title;
      cssClass += opts.cssClass || '';
    }

    let prompt = me.alertCtrl.create({
      title: title,
      message: 'Enter authorization code to continue.',
      cssClass: cssClass,
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'code',
          type: 'password',
          placeholder: 'Code'
        },
      ],
      buttons: [
        {
          text: 'No',
          cssClass: 'cancel_btn',
          handler: data => {
          }
        },
        {
          text: 'Yes',
          cssClass: 'ok_btn',
          handler: data => {
            if (data['code'] == pin) {
              me.viewCtrl.dismiss({game_entry: me.selectedGame});
            } else {
              me.onRecoverClick({title: 'Wrong authorization code!', cssClass: 'wrong_auth_code'});
            }
          }
        }
      ]
    });
    prompt.present();
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
    const tournament = me.tournamentData.tournament;
    const moves = selectedGame.moves.replace(/{.*?}/g, '').replace(/\s+/g, ' ');

    const pgn =
      `[Event "${tournament['name']}"]
       [Site "${tournament['site']}"]
       [Date "${me.parseGameDate(selectedGame)}"]
       [Round "${game.round}"]
       [White "${game.white_player_name}"]
       [Black "${game.black_player_name}"]
       [Result "${selectedGame.result}"]
       [WhiteElo "${game.white_player_rating}"]
       [BlackElo "${game.black_player_rating}"]
       [Group "${game.group_name}"]
       [Table "${game.table}"]
       ${moves}`;

    return pgn;
  }
}
