/* eslint-disable react/no-multi-comp,max-len */
import React, { Component, ComponentType } from 'react';
// eslint-disable-next-line no-unused-vars
import FetchTransport from '../lib/fetch-transport';
import TransportLayer from '../lib/transport-layer';
// eslint-disable-next-line no-unused-vars
import LoadingSpinner, { LoadingProps } from './loading-spinner';

export interface RestViewProps<T> {
  data: T[]; // TODO: figure out how to configure this key
  post: (payload: Partial<T>) => Promise<T>;
}

export interface RestStoreProps<T, ViewProps> {
  View: ComponentType<ViewProps & RestViewProps<T>>;
  viewProps: ViewProps;
  LoadingComponent?: ComponentType<LoadingProps>;
  transportLayer?: TransportLayer;
  api: string;
}

interface RestStoreState<T> {
  loading: boolean;
  response: T[]
}

export default class RestStore<T, ViewProps> extends Component<RestStoreProps<T, ViewProps>, RestStoreState<T>> {
  static defaultProps = {
    transportLayer: FetchTransport,
    LoadingComponent: LoadingSpinner
  };

  state = { loading: true, response: [] };

  render() {
    const { View, LoadingComponent, viewProps } = this.props;
    const { loading, response } = this.state;

    if (loading) {
      // @ts-ignore
      return <LoadingComponent />;
    }

    return <View {...viewProps} data={response} post={this.post} />;
  }

  async componentWillMount() {
    await this.fetchData();
  }

  private async fetchData() {
    this.setState({ loading: true });

    // @ts-ignore
    const response = await this.props.transportLayer.get<T[]>(this.props.api);

    this.setState({
      response,
      loading: false
    });
  }

  private post = async (entity: Partial<T>) => {
    // @ts-ignore
    const response = await this.props.transportLayer.post<T>(this.props.api, entity);

    await this.fetchData();

    return response;
  }
}
