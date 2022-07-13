import {Injectable, OnDestroy} from "@angular/core";
import {HTTP} from '@ionic-native/http';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";

@Injectable()
export class PingService implements OnDestroy {

  pingStream: BehaviorSubject<string>;
  url: string = "https://app.com/PING";
  pingObserver: Subscription;

  constructor(public _http: HTTP) {
    const me = this;
    me.pingStream = new BehaviorSubject<string>('');
  }

  ngOnDestroy(): void {
    const me = this;
    if (me.pingObserver) me.pingObserver.unsubscribe();
  }

  public initPing() {
    const me = this;
    let timeStart: number;
    me.pingObserver = Observable.interval(10000).subscribe(x => {
      timeStart = performance.now();
      me.pingServer();
    });
  }

  public pingServer() {
    const me = this;
    let timeStart = performance.now();
    return me._http.get(me.url, {}, {}).then(
      () => me.pingResponse(timeStart),
      () => me.pingResponse(timeStart));
  }

  public removePingCheck() {
    const me = this;
    if (me.pingObserver) me.pingObserver.unsubscribe();
  }

  private pingResponse(timeStart: number): void {
    const me = this;
    let newValue = 'No internet';
    const internetConnection = navigator.onLine;

    if (internetConnection) {
      let timeEnd: number = performance.now();
      let ping: number = Math.ceil(timeEnd - timeStart);
      newValue = ping.toString();
    }
    me.pingStream.next(newValue);
  }
}
