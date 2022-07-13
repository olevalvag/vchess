import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {HTTP} from "@ionic-native/http";
import {Observable} from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import {
  default as Utils,
  FidePlayerInfo,
  PgnQuickgameRequestParams,
  QuickLiveGameId,
  QuickLiveUpload,
} from "../../utils/utils";
import {request_mobile, request_web} from "../../utils/request_utils";
import {EmptyObservable} from "rxjs/observable/EmptyObservable";
import {Device} from "@ionic-native/device";
import {Platform} from "ionic-angular";

@Injectable()
export class QuickgameProvider {

  private URL_GET_QUICKLIVE_ID: string;
  private URL_GET_FIDE_INFO: string;
  private URL_SEND_QUICKLIVE_DATA: string;
  private TOKEN: string = '';

  constructor(public web_http: Http,
              public mobile_http: HTTP,
              public platform: Platform,
              public device: Device) {
    const me = this;
    me.updateEnvironmentUrls();
  }

  public updateEnvironmentUrls() {
    const me = this;
    const environmentBaseURL = Utils.isProductionEnvironment ? 'http://app.com' : 'http://test.app.com';
    me.URL_GET_QUICKLIVE_ID = `${environmentBaseURL}/QUICKLIVE`;
    me.URL_GET_FIDE_INFO = `${environmentBaseURL}/FIDE`;
    me.URL_SEND_QUICKLIVE_DATA = `${environmentBaseURL}/SEND`;
  }

  public getQuickLiveGameId(): Observable<QuickLiveGameId> {
    const me = this;
    const params = {token: me.TOKEN};
    return me.makeRequest<QuickLiveGameId>(me.URL_GET_QUICKLIVE_ID, params);
  }

  public getFidePlayerInfo(searchParam): Observable<FidePlayerInfo[]> {
    const me = this;
    let doSearch = false;
    const params = {token: me.TOKEN};
    const isNumberSearch = /^\d+$/.test(searchParam);

    if (isNumberSearch) {
      params['fide_id'] = searchParam;
      doSearch = searchParam.length >= 6;
    } else {
      params['player_name'] = searchParam;
      doSearch = searchParam.length >= 3;
    }

    if (doSearch) {
      return me.makeRequest<FidePlayerInfo>(me.URL_GET_FIDE_INFO, params).map(data => {
        if (data.outcome === 'success') {
          const players = JSON.parse(data['players']);
          const result = players.map(x => x as FidePlayerInfo);
          return result;
        }
        return [];
      })
    }
    return new EmptyObservable<FidePlayerInfo[]>();
  }

  public getUuidKey() {
    const me = this;
    if (me.device) return `${me.device.uuid}-${me.device.serial}`;
    return '';
  }

  updateGameData(quickGameId, params: PgnQuickgameRequestParams): Observable<QuickLiveUpload> {
    const me = this;
    const fixParams = {
      token: me.TOKEN,
      qlid: quickGameId,
      tablet_mac_address: me.getUuidKey(),
      tablet_IP_address: Utils.IP_ADDRESS || ''
    };
    const body = {...fixParams, ...params};
    return me.makeRequest<QuickLiveUpload>(me.URL_SEND_QUICKLIVE_DATA, body);
  }

  private makeRequest<T>(url, body): Observable<T> {
    const me = this;
    const isMobile = me.platform.is('android') || me.platform.is('cordova');
    if (isMobile) return request_mobile<T>(me.mobile_http, url, body);
    return request_web<T>(me.web_http, url, body);
  }

}
