import {ErrorReply, SuccessReply} from "./utils";
import {Http} from "@angular/http";
import {Observable} from "../../node_modules/rxjs";
import {post_mobile, post_web} from "./post";
import {HTTP} from "@ionic-native/http";


export function isSuccess<T>(response: T | SuccessReply | ErrorReply | undefined): response is T {
  if (!response) return false;
  // if (response.outcome === "error") return false;
  return true;
}


// WEB REQUEST
export function request_web<T>(http: Http,
                               url: string,
                               args: { [name: string]: any }): Observable<T> {
  return post_web(http, url, args)
    .map(response => {
      if (!response.ok) {
        const errorReply: ErrorReply = {
          outcome: "error",
          status: `${response.status}`,
          message: `${response.statusText}`
        };
        return errorReply;
      }
      return response.json()[0] as T | SuccessReply | ErrorReply | undefined;
    })
    .filter(isSuccess);
}


// MOBILE Request
export function request_mobile<T>(http: HTTP,
                                  url: string,
                                  args: { [name: string]: any }): Observable<T> {
  return post_mobile(http, url, args)
    .map(response => {
      let data = JSON.parse(response.data || "[]");
      data = data[0];

      if (response.status != 200) {
        const errorReply: ErrorReply = {
          outcome: "error",
          status: `${response.status}`,
          message: `${data.message}`
        };
        return errorReply;
      }
      return data as T | SuccessReply | ErrorReply | undefined;
    })
    .filter(isSuccess);
}

