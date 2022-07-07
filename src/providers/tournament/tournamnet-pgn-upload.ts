import {Subject} from "rxjs/Rx";
import {Injectable, OnDestroy} from "@angular/core";
import {TournamentProvider} from "./tournament";
import {PgnRequestParams} from "../../utils/utils";
import {takeUntil} from "rxjs/operators";

@Injectable()
export class TournamentPgnUpload implements OnDestroy {

  pendingResolve: Subject<boolean>;
  private pgnParams: PgnRequestParams;
  private pendingPgn: boolean;
  private refreshTimer: any;
  private subscriptions: Subject<boolean> = new Subject<boolean>();

  constructor(public tournamentProvider: TournamentProvider) {
    const me = this;
    me.pendingPgn = false;
    me.pendingResolve = new Subject<boolean>();
  }

  ngOnDestroy(): void {
    const me = this;
    me.subscriptions.next(true);
    me.subscriptions.unsubscribe();
  }

  public reset() {
    const me = this;
    me.pendingResolve = new Subject<boolean>();
    me.pendingPgn = false;
    window.clearInterval(me.refreshTimer);
    me.refreshTimer = null;
  }

  public networkConnected() {
    return navigator.onLine;
  }

  public hasPendingPgn() {
    const me = this;
    return me.pendingPgn;
  }

  public stopRetryPendingPgn() {
    const me = this;
    return me.reset();
  }

  public retryPendingPgn() {
    const me = this;
    const params = me.pgnParams;
    if (me.pendingPgn) {
      me.tournamentProvider.updateGameData(params)
        .pipe(takeUntil(me.subscriptions))
        .subscribe(() => me.pendingPgn = false);
    }
  }

  public sendPgn(params: PgnRequestParams, forcePending?: Boolean) {
    const me = this;
    me.pgnParams = params;

    if (forcePending) me.pendingPgn = true;

    let request = new Promise((resolve, reject) => {
      me.tournamentProvider.updateGameData(params)
        .pipe(takeUntil(me.subscriptions))
        .subscribe(
          () => {
            me.pendingPgn = false;
            resolve();
          },
          () => {
            me.pendingPgn = true;
            me.retrySendingPendingPgn();
            reject();
          }
        );
    });
    return request;
  }

  private retrySendingPendingPgn() {
    const me = this;
    const params = me.pgnParams;
    if (me.refreshTimer) window.clearInterval(me.refreshTimer);
    me.refreshTimer = window.setInterval(() => {
      if (!me.pendingPgn) {
        window.clearInterval(me.refreshTimer);
      } else {
        me.tournamentProvider.updateGameData(params)
          .pipe(takeUntil(me.subscriptions))
          .subscribe(() => me.pendingPgn = false);
      }
    }, 4000);
  }

}
