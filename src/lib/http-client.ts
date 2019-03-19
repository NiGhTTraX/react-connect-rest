/* eslint-disable semi */
export default interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: Partial<T>): Promise<any>;
  patch<T>(path: string, body: Partial<T>): Promise<T>;
  delete<T>(path: string, body: Partial<T>): void;
}
