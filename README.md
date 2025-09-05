# container

A service container for resolving dependencies that supports classes and functions.

## Getting Started

Using `npm`
```sh
npm install @warp-org/container
```

Or using `yarn`
```sh
yarn add @warp-org/container
```

## Usage

### Resolve

The `app` function registers an instance of class or function, and persists it across the entire application.

> [!NOTE]
> Using `app` again with the same reference, whether a class or a function, returns the first registered instance.

#### Classes

```ts
class CounterService {
  public count: number = 0;

  up() {
    this.count += 1;
  }
}

const counter = app(CounterService);

counter.up();
```

#### Functions

```ts
function counterService() {
  let count = 0;

  const up = () => {
    count += 1;
  }

  return {
    count,
    up
  }
}

const counter = app(counterService);

counter.up();
```

### Register

The `register` method creates a persistent instance to be stored in the container.

#### Variable instance
> [!NOTE]
> You can register a class by it's reference and create variable instances with it's interface based on the reference.

```ts
const production = false;

class User {
  private id: number;

  constructor(id: number) {
    this.id = id;
  }
}

Container.register(User, () => new User(production ? 1 : 2));

```

#### Abstraction binding
```ts
class DatabaseClient {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }
}

class PostgresClient extends DatabaseClient {
  constructor(url: string) {
    super(url);
  }
}

Container.register(DatabaseClient, () => {
  const config = app(ConfigService);

  return new PostgresClient(config.getDatabaseUrl());
});
```

### Transience

Registrations can also be resolved as transient. In this example, both temporary storage methods are resolved but are not related to each other as singletons.

```ts
const userStore = Container.resolve(TemporaryStorage, true);
const productStore = Container.resolve(TemporaryStorage, true);

const users = userStore.getAll();

const products = productStore.where({
    lower: {
        price: 200
    }
});
```

### Memo

Variable `b` retrieves the data earlier because `a` has computed it previously.
  
> [!IMPORTANT]
> The `memo` method only caches by the arguments you pass, make sure to only use pure functions.

```ts
function fib(n: number): number { 
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

const fibonacci = Container.memo(fib);

const a = fibonacci(10);
const b = fibonacci(10);
```

