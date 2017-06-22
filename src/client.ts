import fetch from 'node-fetch';
import * as FormData from 'form-data';

export interface LineNotifyClientParams {
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
  access_token?: string;
}

export type GetTokenResponse = { access_token: string };

export type NotifyResponse = {
  status: number;
  message: string;
};

export interface GetStatusResponse extends NotifyResponse {
  targetType: 'USER' | 'GROUP';
  target: string | 'null';
}

export type RevokeResponse = NotifyResponse;

export class LineNotifyClient {
  static OAUTH_API_BASE = 'https://notify-bot.line.me';
  static API_BASE = 'https://notify-api.line.me';

  private client_id: string;
  private client_secret: string;
  private redirect_uri: string;
  private access_token: string;

  OAUTH_API_BASE = LineNotifyClient.OAUTH_API_BASE;
  API_BASE = LineNotifyClient.API_BASE;

  constructor(params: LineNotifyClientParams) {
    const { client_id, client_secret, redirect_uri, access_token } = params;
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.redirect_uri = redirect_uri;
    this.access_token = access_token;
  }

  getToken(code: string, redirect_uri?: string) {
    const API_URL = this.OAUTH_API_BASE + '/oauth/token';
    const form = new FormData();

    form.append('grant_type', 'authorization_code');
    form.append('code', code);
    form.append('redirect_uri', redirect_uri || this.redirect_uri);
    form.append('client_id', this.client_id);
    form.append('client_secret', this.client_secret);

    return fetch(API_URL, { method: 'POST', body: form })
      .then(res => res.json())
      .then((res: GetTokenResponse) => {
        if (res.access_token) { this.access_token = res.access_token; }
        return res;
      });
  }

  notify(message: string): Promise<NotifyResponse> {
    const API_URL = this.API_BASE + '/api/notify';
    const form = new FormData();

    form.append('message', message);

    return fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + this.access_token },
      body: form
    })
      .then(res => res.json());
  }

  getStatus(access_token?: string): Promise<GetStatusResponse> {
    const API_URL = this.API_BASE + '/api/status';

    return fetch(API_URL, {
      headers: { Authorization: 'Bearer ' + (access_token || this.access_token) }
    })
      .then(res => res.json());
  }

  revoke(access_token?: string): Promise<RevokeResponse> {
    const API_URL = this.API_BASE + '/api/revoke';

    return fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + (access_token || this.access_token) }
    })
      .then(res => res.json());
  }
}
