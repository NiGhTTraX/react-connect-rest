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
