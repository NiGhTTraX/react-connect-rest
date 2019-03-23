/* eslint-disable class-methods-use-this */
import HttpRestClient, {
  GetModel,
  RestResponse,
  PostPayload, PatchPayload, DeletePayload
} from './http-rest-client';

export default class FetchClient implements HttpRestClient {
  get<T>(path: string) {
    return fetch(path)
      .then(resp => resp.json() as unknown as RestResponse<T>);
  }

  post<T>(path: string, body: PostPayload<T>) {
    return this.doFetchWithBody<RestResponse<GetModel<T>>>(path, body, 'POST');
  }

  patch<T>(path: string, body: PatchPayload<T>) {
    return this.doFetchWithBody<RestResponse<GetModel<T>>>(path, body, 'PATCH');
  }

  async delete<T>(path: string, body?: DeletePayload<T>): Promise<void> {
    await this.doFetchWithBody(path, body, 'DELETE');
  }

  private doFetchWithBody<R>(path: string, body: any, method: string) {
    return fetch(path, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(resp => resp.json() as unknown as R);
  }
}
