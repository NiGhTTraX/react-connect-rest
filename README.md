> Connect your React views to REST endpoints in a type safe way

----

## Usage

```tsx
interface MyViewProps {
  data: number[];
  foo: string;
}

const MyView = ({ data, foo }: MyViewProps) => <div>
  Here is the data from the API: {JSON.stringify(data)}
  And here are the other props: {foo}
</div>;

const ConnectedView = connectToRest(MyView, '/my/api/');

ReactDOM.render(<ConnectedView foo="bar" />);
```


## Options

```tsx
interface RestViewProps<T> {
  /**
   * The endpoint is assumed to return a collection of entities
   * on a GET request.
   */
  data: T[];

  /**
   * The view gets a method to create a new entity via a POST
   * request.
   */
  post: (payload: Partial<T>) => Promise<T>;
}

interface RestStoreProps<T, ViewProps> {
  View: ComponentType<ViewProps & RestViewProps<T>>;
  viewProps: ViewProps;
  LoadingComponent?: ComponentType<LoadingProps>;
  transportLayer?: TransportLayer;
  api: string;
}

type connectToRestOptions<T, ViewProps> = {
  /**
   * This is used to create a pretty display name for the HOC.
   * By default it gets the collection name from a RESTful
   * URL e.g. /api/v1/post/ => 'post'.
   */
  getDisplayNameFromApi: (url: string) => string;

  /**
   * This is the component that will handle all the requests
   * and hold the response state.
   */
  StateWrapper: ComponentType<RestStoreProps<T, ViewProps>>;
};

type connectToRest<T, ViewProps> = (
  View: ComponentType<ViewProps & RestViewProps<T>>,
  api: string,
  options: connectToRestOptions<T, ViewProps>
) => ComponentType<ViewProps>;
```
