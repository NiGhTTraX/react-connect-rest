> Connect your React views to REST endpoints in a type safe way

----

## Usage

```tsx
import connectToRest, { IRestStore } from 'react-rest-connect';

interface MyViewProps {
  container: IRestStore<number>;
}

const MyView = ({ container, foo }: MyViewProps) => <div>
  {container.state.loading ? 'Loading...' : <p>
    Here is the data from the API:
    {JSON.stringify(container.state.response)}
  </p>}
</div>;

const ConnectedView = connectToRest(MyView, '/my/api/');

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
const ConnectedView1 = connectToRest(MyView, container);
const ConnectedView2 = connectToRest(MyView, container);

ReactDOM.render(<div>
  <ConnectedView1 />
  <ConnectedView2 />
</div>);
```
