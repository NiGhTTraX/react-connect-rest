import { ComponentType } from 'react';
import connectToState from 'react-state-connect';
import RestStore from './components/rest-store';
import { Omit } from 'react-bind-component';
import FetchTransport from './lib/fetch-transport';

export function connectToRest<
  ViewProps extends Record<K, RestStore<T>>,
  T,
  K extends string
>(
  View: ComponentType<ViewProps>,
  api: string,
  prop: K
): ComponentType<Omit<ViewProps, K>>;


export function connectToRest<
  ViewProps extends Record<K, RestStore<T>>,
  T,
  K extends string
>(
  View: ComponentType<ViewProps>,
  container: RestStore<T>,
  prop: K
): ComponentType<Omit<ViewProps, K>>;

/**
 * @param View
 * @param containerOrApi If a string is given then a new state container will be created and
 *   connected to the view. If you call the method again you'll end up with 2 containers that
 *   query the same API. If you want to have a single container connected to multiple views
 *   then create a container separately and pass it here.
 * @param prop
 */
export default function connectToRest<
  ViewProps extends Record<K, RestStore<T>>,
  T,
  K extends string
>(
  View: ComponentType<ViewProps>,
  containerOrApi: RestStore<T> | string,
  prop: K
): ComponentType<Omit<ViewProps, K>> {
  if (typeof containerOrApi === 'string') {
    return connectToState(View, new RestStore(containerOrApi, FetchTransport), prop);
  }

  return connectToState(View, containerOrApi, prop);
}
