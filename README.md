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

const app = Lizard.create();

app.get('/', async (event) => {
    return new Response("Home Page", { status: 200 });
});

app.get('/user/:id', async (event) => {
    return new Response(`User ${event.params?.id}`, { status: 200 });
});

app.post('/user', async (event) => {
    return new Response("User Created", { status: 200 });
});

app.listen(3000);
```

## License

This project is licensed under the MIT License.