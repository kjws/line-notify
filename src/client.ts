import fetch from 'node-fetch';
import * as FormData from 'form-data';

export type LineNotifyClientParams = {
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
};

export type GetTokenResponse = { access_token: string };

export interface NotifyOptionalParams {
  imageThumbnail?: string;
  imageFullsize?: string;
  imageFile?: any;
  stickerPackageId?: number;
  stickerId?: number;
}

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

  OAUTH_API_BASE = LineNotifyClient.OAUTH_API_BASE;
  API_BASE = LineNotifyClient.API_BASE;

  constructor(params: LineNotifyClientParams) {
    const { client_id, client_secret, redirect_uri } = params;
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.redirect_uri = redirect_uri;
  }

  getToken(code: string, redirect_uri?: string): Promise<GetTokenResponse> {
    const API_URL = this.OAUTH_API_BASE + '/oauth/token';
    const form = new FormData();

    form.append('grant_type', 'authorization_code');
    form.append('code', code);
    form.append('redirect_uri', redirect_uri || this.redirect_uri);
    form.append('client_id', this.client_id);
    form.append('client_secret', this.client_secret);

    return fetch(API_URL, { method: 'POST', body: form }).then(res => res.json());
  }

  notify(access_token: string, message: string, params?: NotifyOptionalParams): Promise<NotifyResponse> {
    const API_URL = this.API_BASE + '/api/notify';
    const form = new FormData();

    form.append('message', message);

    const {
      imageThumbnail, imageFullsize, imageFile, stickerPackageId, stickerId
    } = params || {} as NotifyOptionalParams;
    if (imageThumbnail) { form.append('imageThumbnail', imageThumbnail); }
    if (imageFullsize) { form.append('imageFullsize', imageFullsize); }
    if (imageFile) { form.append('imageFile', imageFile); }
    if (stickerPackageId) { form.append('stickerPackageId', stickerPackageId); }
    if (stickerId) { form.append('stickerId', stickerId); }

    return fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + access_token },
      body: form
    }).then(res => res.json());
  }

  getStatus(access_token: string): Promise<GetStatusResponse> {
    const API_URL = this.API_BASE + '/api/status';

    return fetch(API_URL, {
      headers: { Authorization: 'Bearer ' + access_token }
    }).then(res => res.json());
  }

  revoke(access_token: string): Promise<RevokeResponse> {
    const API_URL = this.API_BASE + '/api/revoke';

    return fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + access_token }
    }).then(res => res.json());
  }
}
