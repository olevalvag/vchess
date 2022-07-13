import {Injectable} from "@angular/core";
import {HTTP} from '@ionic-native/http';
import {Http} from "@angular/http";
import {Observable} from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import {parseClockSettings} from "../../core/chess/ClockSettings";
import {
  default as Utils,
  GameData,
  PgnRequestParams,
  PID_PIN,
  Tablet,
  Tournament,
  TournamentGame
} from "../../utils/utils";
import {request_mobile, request_web} from "../../utils/request_utils";
import {Platform} from "ionic-angular";


@Injectable()
export class TournamentProvider {

  private URL_REGISTER_TABLET: string;
  private URL_GET_TOURNAMENT: string;
  private URL_GET_ASSIGNED_GAME: string;
  private URL_GAME_DATA: string;
  private URL_PID: string;

  constructor(public web_http: Http,
              public mobile_http: HTTP,
              public platform: Platform,) {
    const me = this;
    me.updateEnvironmentUrls();
  }

  public updateEnvironmentUrls() {
    const me = this;
    const environmentBaseURL = Utils.isProductionEnvironment ? 'http://app.com' : 'http://test.app.com';
    me.URL_REGISTER_TABLET = `${environmentBaseURL}/REGISTER`;
    me.URL_GET_TOURNAMENT = `${environmentBaseURL}/TOURNAMENT`;
    me.URL_GET_ASSIGNED_GAME = `${environmentBaseURL}/GAME`;
    me.URL_GAME_DATA = `${environmentBaseURL}/DATA`;
    me.URL_PID = `${environmentBaseURL}/PID`;
  }

  public registerTablet(key: string, pin: string): Observable<Tablet> {
    const me = this;
    const params = {t_key: key, t_pin: pin, battery_status: me.getBatteryLevel()};
    return me.makeRequest<Tablet>(me.URL_REGISTER_TABLET, params);
  }

  public getTournament(pin: string): Observable<Tournament> {
    const me = this;
    const params = {t_pin: pin};
    return me.makeRequest<Tournament>(me.URL_GET_TOURNAMENT, params);
  }

  public getAssignedGame(key: string, pin: string): Observable<TournamentGame> {
    const me = this;
    const params = {t_key: key, t_pin: pin, battery_status: me.getBatteryLevel()};
    const parseTimeControl = (newGame) => {
      let timeControl = newGame['time_control'];
      if (timeControl) return timeControl;
    };

    return me.makeRequest<TournamentGame>(me.URL_GET_ASSIGNED_GAME, params)
      .map(game => {
          return {
            ...game,
            clockSettings: parseClockSettings(game.clock_template_details),
            time_control: parseTimeControl(game)
          };
        }
      );
  }

  public updateGameData(params: PgnRequestParams): Observable<GameData> {
    const me = this;
    const requestParams = {
      t_key: params.key,
      approximate_clocks: params.approximate_clocks,

      battery_status: me.getBatteryLevel(),
      t_pin: params.pin,
      gid: params.gid,
      game_status: params.game_status,
      pgn_data: params.pgn || '',
      w_p_clock: params.white_clock || '',
      b_p_clock: params.black_clock || '',
      number_of_moves: params.number_of_moves || 0
    };
    return me.makeRequest<GameData>(me.URL_GAME_DATA, requestParams);
  }

  public fetchPidCode(pid: string): Observable<PID_PIN> {
    const me = this;
    const params = {token: '--TOKEN--', PID: pid};
    return me.makeRequest<PID_PIN>(me.URL_PID, params);
  }

  protected getBatteryLevel() {
    const battery = Utils.batteryStatus;
    if (battery) return battery.level;
    return 0;
  }

  private makeRequest<T>(url, body): Observable<T> {
    const me = this;
    const isMobile = me.platform.is('android') || me.platform.is('cordova');
    if (isMobile) {
      return request_mobile<T>(me.mobile_http, url, body);
    }
    return request_web<T>(me.web_http, url, body);
  }

}
