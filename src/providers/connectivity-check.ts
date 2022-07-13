import {Injectable} from "@angular/core";
import {Platform} from 'ionic-angular';
import {Network} from "@ionic-native/network";


declare var Connection;

@Injectable()
export class ConnectivityCheck {

  onDevice: boolean;

  constructor(public platform: Platform,
              public network: Network) {
    const me = this;
    me.onDevice = me.platform.is('cordova');
  }

  isOnline(): boolean {
    const me = this;
    const connectionType = me.network.type;

    if (me.onDevice && me.network.type) {
      return connectionType !== Connection.NONE;
    }

    return navigator.onLine;
  }

  isOffline(): boolean {
    const me = this;
    const connectionType = me.network.type;

    if (me.onDevice && connectionType) {
      return connectionType === Connection.NONE;
    }
    return !navigator.onLine;

  }
}
