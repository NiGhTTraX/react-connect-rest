/* eslint-disable semi,no-unused-vars */
import { Omit } from 'react-bind-component';

type RestModel<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    // Transform to many relations into lists of IDs
    ? U extends { id: infer X } ? X[] : U[]
    : T[P] extends { id: infer Y }
      // and to single relations into IDs
      ? Y
      // and leave everything else untouched.
      : T[P];
};

export type GetModel<T> = T extends Array<infer U>
  ? U extends { id: any } ? U : never
  : T extends { id: any } ? T : never;

type ToManyRelations<T, U = GetModel<T>> = {
  [P in keyof U]: U[P] extends Array<infer U>
    ? U extends { id: any } ? P : never
    : never
}[keyof U];

type ToSingleRelations<T, U = GetModel<T>> = {
  [P in keyof U]: U[P] extends { id: any } ? P : never
}[keyof U];

export type HATEOASLink<T> = {
  href: string;
  rel: ToManyRelations<T> | ToSingleRelations<T>;
};

export type HATEOASMetadata<T> = {
  __links: HATEOASLink<T>[];
};

export type RestData<T> = HATEOASMetadata<T> & RestModel<T>;

export type RestResponse<T> = {
  data: T extends Array<infer U> ? RestData<U>[] : RestData<T>;
};

export type PostPayload<T> = Omit<RestModel<GetModel<T>>, 'id'>;

// If the PATCH is done on a collection then the entity needs to
// be identified by its ID, otherwise it can be omitted.
export type PatchPayload<T> = T extends Array<infer U>
  ? U extends { id: any } ? Pick<U, 'id'> & Partial<Omit<U, 'id'>> : never
  : T extends { id : any } ? Partial<T> : never;

// If the DELETE is done on a collection then the entity needs to
// be identified by its ID, otherwise the payload should be empty.
export type DeletePayload<T> = T extends Array<infer U>
  ? U extends { id: any } ? Pick<U, 'id'> : never
  : never;

export default interface HttpRestClient {
  get<T>(path: string): Promise<RestResponse<T>>;

  post<T>(path: string, body: PostPayload<T>): Promise<RestResponse<GetModel<T>>>;

  // TODO: when making a PATCH on a collection the entire updated
  // collection should be returned
  patch<T>(path: string, body: PatchPayload<T>): Promise<RestResponse<GetModel<T>>>;

  delete<T>(path: string, body: DeletePayload<T>): Promise<void>;
  delete<T>(path: string): Promise<void>;
}
