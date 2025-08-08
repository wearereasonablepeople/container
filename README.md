# Container

A simple container for resolving dependencies that supports classes and functions.

## Getting Started

Using `npm`
```sh
npm install @echtejosh/container
```

Or using `yarn`
```sh
yarn add @echtejosh/container
```

## Usage

### Resolve

The `app` function registers an instance of class or function, and persists their state across the entire application.

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

counter.up()
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

counter.up()
```

### Memo

Variable `b` retrieves the data earlier because `a` has computed it previously.
  
> [!NOTE]
> The `memo` method only caches by the arguments you pass, make sure to only use pure functions.

```ts
function fibonacci(n: number): number {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

const fib = Container.memo(fib);

const a = fib(10)
const b = fib(10)
```

### Patterns

Create patterns for services and dependencies.

> [!NOTE]
> The container does not inspect constructor parameters. Instead, it provides functions that you can use to use your own patterns:

```ts
const production = false;

class User {
  private id: number;

  constructor(id: number) {
    this.id = id;
  }
}

Container.register(User, () => new User(production ? 1 : 2))

```
