import { Component } from 'react';

export interface LoadingProps {
}

export default class LoadingSpinner extends Component<LoadingProps> {
  render() {
    return 'loading...';
  }
}
