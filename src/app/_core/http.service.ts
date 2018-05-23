import { Injectable } from '@angular/core';
import { Request, XHRBackend, RequestOptions, Response, Http, RequestOptionsArgs, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SessionService } from './index';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { roles } from './constants';

@Injectable()
export class HttpService extends Http {

  role: string;

  constructor(backend: XHRBackend, defaultOptions: RequestOptions, private sessionService: SessionService) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {

    if (typeof url === 'string') { // meaning we have to add the token to the options, not in url
      if (!options) {
        // let's make option object
        options = { headers: new Headers() };
      }

      this.role = this.sessionService.getUserRole(url);

      options.headers.set('x-access-token', this.sessionService.getUserToken(this.role));
      options.headers.set('from', this.sessionService.getUserEmail(this.role));

    } else {

      this.role = this.sessionService.getUserRole(url.url);

      // we have to add the token to the url object
      url.headers.set('x-access-token', this.sessionService.getUserToken(this.role));
      url.headers.set('from', this.sessionService.getUserEmail(this.role));
    }
    return super.request(url, options).catch((error: Response) => {
      if (error.status === 401 || error.status === 403) {
        this.sessionService.destroyUser(this.role)
      }

      return Observable.throw(error);
    });
  }

}