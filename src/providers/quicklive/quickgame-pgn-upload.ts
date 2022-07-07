import {Subject} from "rxjs/Rx";
import {Injectable, OnDestroy} from "@angular/core";
import {PgnQuickgameRequestParams} from "../../utils/utils";
import {QuickgameProvider} from "./quicklive";
import {takeUntil} from "rxjs/operators";

@Injectable()
export class QuickgamePgnUpload implements OnDestroy {

  pendingResolve: Subject<boolean>;
  gameID: number;
  private pgnParams: PgnQuickgameRequestParams;
  private pendingPgn: boolean;
  private refreshTimer: any;
  private subscriptions: Subject<boolean> = new Subject<boolean>();

  constructor(public quickgameProvider: QuickgameProvider) {
    const me = this;
    me.pendingPgn = false;
    me.pendingResolve = new Subject<boolean>();
  }

  public init(qlId) {
    const me = this;
    me.gameID = qlId;
    me.reset()
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
      me.quickgameProvider.updateGameData(me.gameID, params)
        .pipe(takeUntil(me.subscriptions))
        .subscribe(() => me.pendingPgn = false);
    }
  }

  public sendPgn(params: PgnQuickgameRequestParams) {
    const me = this;
    me.pgnParams = params;
    let request = new Promise((resolve, reject) => {
      me.quickgameProvider.updateGameData(me.gameID, params)
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
        me.quickgameProvider.updateGameData(me.gameID, params)
          .pipe(takeUntil(me.subscriptions))
          .subscribe(() => me.pendingPgn = false);
      }
    }, 4000);
  }

}
