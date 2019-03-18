> An experimental and WIP approach to a type safe and self traversing REST client.

[![Build Status](https://travis-ci.com/NiGhTTraX/react-connect-rest.svg?branch=master)](https://travis-ci.com/NiGhTTraX/react-connect-rest)
[![codecov](https://codecov.io/gh/NiGhTTraX/react-connect-rest/branch/master/graph/badge.svg)](https://codecov.io/gh/NiGhTTraX/react-connect-rest)

----

## Usage

```tsx
import connectToRest, { IRestStore } from 'react-connect-rest';

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


## Assumptions

As mentioned, this lib has opinions about how a REST endpoint
and how the data it returns looks:

1. All entities can be uniquely identifiable by an `id` key.
2. Collections handle POST and DELETE, entities handle PUT and PATCH.
3. The API is self describing via HATEOAS metadata stored under a `__links` key.

## Resolving relations via HATEOAS

```typescript
import { RelationalStore } from 'react-connect-rest';

type ForeignEntity = { id: number; foo: string; }
type Collection = { id: number; entities: ForeignEntity[]; }

//  GET /collection
//    {
//      data: [{
//        __links: [{ rel: 'entities', href: '/entities?collection=1' }],
//        id: 1,
//        entities: [1]
//      }]
//    }
//
//  GET /entities?collection=1
//    {
//       data: [{
//         __links: [],
//         id: 1,
//         foo: 'bar'
//       }]
//    }
const collectionStore = new RelationalStore<Collection[]>('/collection');

const entityStore = collectionStore.state.response.data[0].entities;

console.log(entityStore.state.response[0].data.foo);
```


## Connecting multiple views to the same API

```tsx
import connectToRest, { RestStore, IRestStore } from 'react-connect-rest';

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
import { RestCollectionStoreMock } from 'react-connect-rest';

const mock = new RestCollectionStoreMock<number>([1, 2, 3]);

mock.state.loading === false
mock.state.response[0] === 1
```
