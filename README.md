> This is what I imagine a type safe way of connecting a React component
to a REST endpoint might look like. Heavily opinionated and not production
ready, this is an _**experimental project**_.

[![Build Status](https://travis-ci.com/NiGhTTraX/react-rest-connect.svg?branch=master)](https://travis-ci.com/NiGhTTraX/react-rest-connect)
[![codecov](https://codecov.io/gh/NiGhTTraX/react-rest-connect/branch/master/graph/badge.svg)](https://codecov.io/gh/NiGhTTraX/react-rest-connect)

----

## Usage

```tsx
import connectToRest, { IRestStore } from 'react-rest-connect';

interface MyViewProps {
  container: IRestStore<number>;
}

const MyView = ({ myData, foo }: MyViewProps) => <div>
  {myData.state.loading ? 'Loading...' : <p>
    Here is the data from the API:
    {JSON.stringify(myData.state.response)}
  </p>}
</div>;

// All 3 types need to be specified until
// https://github.com/Microsoft/TypeScript/issues/10571 is implemented.
const ConnectedView = connectToRest<MyViewProps, number, 'myData'>(
  MyView, '/my/api/', 'myData'
);

ReactDOM.render(<ConnectedView />);
```


## Connecting multiple views to the same API

```tsx
import connectToRest, { RestStore, IRestStore } from 'react-rest-connect';

const container = new RestStore<number>('/my/api/');

interface MyViewProps {
  container: IRestStore<number>;
}

const MyView1 = ({ container, foo }: MyViewProps) => null;
const MyView2 = ({ container, foo }: MyViewProps) => null;

// We'll have a single container querying the API and multiple
// views listening to it.
const ConnectedView1 = connectToRest(MyView, container, 'container');
const ConnectedView2 = connectToRest(MyView, container, 'container');

ReactDOM.render(<div>
  <ConnectedView1 />
  <ConnectedView2 />
</div>);
```


## Testing

You can create stores with mocked data for use in tests:

```tsx
import { RestStoreMock } from 'react-rest-connect';

const mock = new RestStoreMock<number>([1, 2, 3]);

mock.state.loading === false
mock.state.response[0] === 1
```
