import TransportLayer from './transport-layer';

const FetchTransport: TransportLayer = {
  get<T>(path: string) {
    // @ts-ignore
    return fetch(path).then(resp => resp.json() as T);
  },

  post<T>(path: string, body: Partial<T>) {
    return fetch(path, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    // @ts-ignore
    }).then(resp => resp.json() as T);
  },

  patch<T>(path: string, body: Partial<T>): Promise<T> {
    return fetch(path, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
      // @ts-ignore
    }).then(resp => resp.json() as T);
  }
};

export default FetchTransport;
