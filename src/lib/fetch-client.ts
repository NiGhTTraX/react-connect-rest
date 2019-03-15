import StorageClient from './storage-client';

const FetchClient: StorageClient = {
  get<T>(path: string) {
    // @ts-ignore
    return fetch(path).then(resp => resp.json() as T);
  },

  set<T>(path: string, body: Partial<T>) {
    return doFetchWithBody(path, body, 'POST');
  },

  update<T>(path: string, body: Partial<T>): Promise<T> {
    return doFetchWithBody(path, body, 'PATCH');
  },

  async delete<T>(path: string, body: Partial<T>): Promise<void> {
    await doFetchWithBody(path, body, 'DELETE');
  }
};

function doFetchWithBody<T>(path: string, body: Partial<T>, method: string) {
  return fetch(path, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(resp => resp.json() as unknown as T);
}

export default FetchClient;