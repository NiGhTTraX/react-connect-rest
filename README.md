> An experimental and WIP approach to a type safe and self traversing REST client.

[![Build Status](https://travis-ci.com/NiGhTTraX/react-connect-rest.svg?branch=master)](https://travis-ci.com/NiGhTTraX/react-connect-rest)
[![codecov](https://codecov.io/gh/NiGhTTraX/react-connect-rest/branch/master/graph/badge.svg)](https://codecov.io/gh/NiGhTTraX/react-connect-rest)

----

## Usage

```typescript jsx
import connectToRest, { IRestStore } from 'react-connect-rest';
import React from 'react';
import { render } from 'react-dom';

interface Foo {
  id: number;
  foo: string;
}

interface MyViewProps {
  container: IRestStore<Foo>;
}

const MyView = ({ myData }: MyViewProps) => <div>
  {myData.state.loading ? 'Loading...' : <p>
    Here is the data from the API:
    {JSON.stringify(myData.state.response)}
  </p>}
</div>;

const ConnectedView = connectToRest(MyView, { myData: '/my/api/' });

render(<ConnectedView />);
```


## Assumptions

As mentioned, this lib has opinions about how a REST endpoint
and how the data it returns looks:

1. All entities can be uniquely identifiable by an `id` key.
1. The API is self describing via HATEOAS metadata stored under a `__links` key.


## Resolving relations via HATEOAS

```typescript
import { RestStore } from 'react-connect-rest';

type Author = { id: number; name: string; }
type Book = { id: number; authors: Author[]; }

//  GET /book
//    {
//      data: [{
//        __links: [{ rel: 'authors', href: '/author/?book=1' }],
//        id: 1,
//        authors: [1]
//      }]
//    }
//
//  GET /author/?book=1
//    {
//       data: [{
//         __links: [],
//         id: 1,
//         name: 'Foo Bar'
//       }]
//    }
const bookStore = new RestStore<Book[]>('/book');

const firstBooksAuthors = bookStore.state.response.authors;

console.log(firstBooksAuthors.state.response[0].name);
```


## Connecting multiple views to the same API

```typescript jsx
import connectToRest, { RestStore, IRestStore } from 'react-connect-rest';
import React from 'react';
import { render } from 'react-dom';


interface Foo {
  id: number;
  foo: string;
}

interface MyViewProps {
  container: IRestStore<Foo>;
}

const container = new RestStore<Foo>('/my/api/');

const MyView1 = ({ container }: MyViewProps) => null;
const MyView2 = ({ container }: MyViewProps) => null;

// We'll have a single container querying the API and multiple
// views listening to it.
const ConnectedView1 = connectToRest(MyView1, { container });
const ConnectedView2 = connectToRest(MyView2, { container });

render(<div>
  <ConnectedView1 />
  <ConnectedView2 />
</div>);
```


## Testing

You can create stores with mocked data for use in tests:

```typescript jsx
import { RestStoreMock } from 'react-connect-rest';

interface Foo {
  id: number;
  foo: string;
}

const mock = new RestStoreMock<Foo>({ id: 1, foo: 'bar' });

console.log(mock.state.loading); // false
console.log(mock.state.response); // { id: 1, foo: 'bar' }
```
