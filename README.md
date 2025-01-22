# Lizard

Lizard is a lightweight and fast web framework built on top of [Bun](https://bun.sh), a fast all-in-one JavaScript runtime. This project provides a simple and efficient way to create web applications with minimal setup.

## Features

- **Fast and Lightweight**: Built on Bun, ensuring high performance.
- **Simple Routing**: Define routes easily with support for dynamic parameters.
- **Middleware Support**: Add middleware functions to handle requests.
- **TypeScript Support**: Written in TypeScript for type safety and better development experience.

## Installation

To install dependencies, run:

```bash
bun install
```

## Running the Application

To start the application, run:

```bash
bun run index.ts
```

The server will start on port 3000 by default.

## Project Structure

```plaintext
├── .gitignore
├── bun.lockb
├── index.ts
├── lizard.ts
├── package.json
├── README.md
├── tsconfig.json
├── types.ts
├── utils.test.ts
└── utils.ts
```

- **index.ts**: Entry point of the application.
- **lizard.ts**: Core framework implementation.
- **types.ts**: Type definitions for the framework.
- **utils.ts**: Utility functions used by the framework.
- **utils.test.ts**: Unit tests for utility functions.

## Example Usage

Here is an example of how to define routes in your application:

```ts
import Lizard from "./lizard";
import type { Middleware } from "./types";

const app = Lizard.create();

// Global middleware to log requests
const loggerMiddleware: Middleware = async (event, next) => {
	console.log(`Request: ${event.method} ${event.url}`);
	return next();
};

// Global middleware to add a custom header
const headerMiddleware: Middleware = async (event, next) => {
	event.response.headers.set('X-Custom-Header', 'Lizard');
	return next();
};

// Apply global middlewares
app.use(loggerMiddleware);
app.use(headerMiddleware);

app.get('/', async (event) => {
	return event.response.send("Hello, World!");
});

app.get('/home', async (event) => {
	return event.response.send("Home Page");
});

app.get('/home/:id', async (event) => {
	return event.response.send("Home Page" + event.params?.id);
});

app.get('/home/:id', async (event) => {
	return event.response.send(`User ${event.params?.id}`);
});

app.get('/home/:id', async (event) => {
	return event.response.send(`User ${event.params?.id}`);
});

app.get('/home/:id/profile', async (event) => {
	return event.response.send(`User ${event.params?.id} Profile`);
});

app.post('/user', async (event) => {
	return event.response.send("User Created");
});

app.put('/user/:id', async (event) => {
	return event.response.send(`User ${event.params?.id} Updated`);
});

app.del('/user/:id', async (event) => {
	return event.response.send(`User ${event.params?.id} Deleted`);
});


app.listen(3000);
```

In this example, the middleware sets a `user` object in the `event.locals` property. The `/profile` route then accesses this local variable and returns the user's name in the response.

## License

This project is licensed under the MIT License.