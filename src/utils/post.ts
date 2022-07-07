import {Observable} from "rxjs/Rx";
import {HTTP, HTTPResponse} from '@ionic-native/http';
import {fromPromise} from "rxjs/observable/fromPromise";
import {Http, Response} from "@angular/http";


////////////////////////// WEB post request
export function post_web(
  http: Http,
  url: string,
  body: { [name: string]: string }
): Observable<Response> {
  // console.log(`POSTing to ${url} with body ${JSON.stringify(body)}`);

  const formData = new FormData();
  Object.keys(body).forEach(key => {
    formData.append(key, body[key]);
  });

  return http.post(url, formData);
}


////////////////////////// MOBILE post request
export function post_mobile(
  http: HTTP,
  url: string,
  body: { [name: string]: string }
): Observable<HTTPResponse> {
  // console.log(`POSTing to ${url} with body ${JSON.stringify(body)}`);

  const formData = {};
  Object.keys(body).forEach(key => {
    formData[key] = body[key];
  });

  return fromPromise(http.post(url, formData, {}));
}
