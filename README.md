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

```ts
// Middleware example to log request details
app.use(async (event, next) => {
    console.log(`Request: ${event.request.method} ${event.request.url}`);
    return next(event);
});

// Middleware example to add a custom header to the response
app.use(async (event, next) => {
    const response = await next(event);
    response.headers.set("X-Custom-Header", "LizardFramework");
    return response;
});
```

## Handling Request JSON, Form Data, and Files

Lizard provides easy-to-use methods for handling JSON, form data, and file uploads in your routes.

### Handling JSON

To handle JSON data in your routes, use the `event.request.json()` method:

```ts
app.post('/json', async (event) => {
    const data = await event.request.json();
    return new Response(`Received JSON: ${JSON.stringify(data)}`, { status: 200 });
});
```

### Handling Form Data

To handle form data, use the `event.request.formData()` method:

```ts
app.post('/form', async (event) => {
    const formData = await event.request.formData();
    const name = formData.get('name');
    return new Response(`Received Form Data: ${name}`, { status: 200 });
});
```

### Handling File Uploads

To handle file uploads, use the `event.request.formData()` method and access the file from the form data:

```ts
app.post('/upload', async (event) => {
    const formData = await event.request.formData();
    const file = formData.get('file') as File;
    const fileContents = await file.text();
    return new Response(`Received File: ${file.name} with contents: ${fileContents}`, { status: 200 });
});
```

In these examples, the routes handle different types of request data and respond accordingly.


## Handling Local Variables

Lizard allows you to define and use local variables within your routes and middleware. This can be useful for sharing data between different parts of your application.

### Example Usage

Here is an example of how to set and access local variables in your application:

```ts
import Lizard from "./lizard";

const app = Lizard.create();

// Middleware to set a local variable
app.use(async (event, next) => {
    event.locals.user = { id: 1, name: "John Doe" };
    return next(event);
});

// Route to access the local variable
app.get('/profile', async (event) => {
    const user = event.locals.user;
    return new Response(`User Profile: ${user.name}`, { status: 200 });
});

app.listen(3000);
```

In this example, the middleware sets a `user` object in the `event.locals` property. The `/profile` route then accesses this local variable and returns the user's name in the response.

## License

This project is licensed under the MIT License.