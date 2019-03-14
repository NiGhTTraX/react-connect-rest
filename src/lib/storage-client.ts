/* eslint-disable semi */
export default interface StorageClient {
  get<T>(path: string): Promise<T>;
  set<T>(path: string, body: Partial<T>): Promise<T>;
  update<T>(path: string, body: Partial<T>): Promise<T>;
  delete<T>(path: string, body: Partial<T>): void;
}
