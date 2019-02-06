/* eslint-disable semi */
export default interface TransportLayer {
  get<T>(path: string): Promise<T>;

  post<T>(path: string, body: Partial<T>): Promise<T>;

  patch<T>(path: string, body: Partial<T>): Promise<T>;
}
