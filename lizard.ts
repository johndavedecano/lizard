import Bun from 'bun'
import type { LizardApp, LizardVersion, Middleware, RequestCallback, RequestEvent, RequestMethod, Route, RouteMatch } from './types';
import { matchRoute, pathToRegex } from './utils';


/**
 * Creates a new Lizard application context.
 *
 * This function initializes the application context, including route registration methods,
 * a logger, and a request handler. It also provides methods to start and stop the server.
 *
 * @returns {LizardApp} The initialized Lizard application context.
 *
 * The returned object includes the following properties and methods:
 * - `version`: The version of the Lizard application.
 * - `locals`: A map of local variables that can be accessed by middleware functions.
 * - `get(path: string, callback: RequestCallback): void`: Registers a GET route.
 * - `post(path: string, callback: RequestCallback): void`: Registers a POST route.
 * - `patch(path: string, callback: RequestCallback): void`: Registers a PATCH route.
 * - `del(path: string, callback: RequestCallback): void`: Registers a DELETE route.
 * - `put(path: string, callback: RequestCallback): void`: Registers a PUT route.
 * - `listen(port: number = 5000, callback?: () => void): void`: Starts the server on the specified port.
 * - `stop(): void`: Stops the server if it is running.
 * - `use(middleware: Middleware): void`: Adds a middleware function to the global middlewares array.
 */
const createContext = (): LizardApp => {

    let server: ReturnType<typeof Bun.serve> | null = null;

    const routes: Route[] = [];

    const globalMiddlewares: Middleware[] = [];

    const locals = new Map<string, unknown>();

    const logger = (message: string) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    };

    /**
     * Adds a middleware function to the global middlewares array.
     *
     * @param middleware - The middleware function to be added.
     */
    const use = (middleware: Middleware): void => {
        globalMiddlewares.push(middleware);
    };

    /**
     * Registers a new route.
     * @param {RequestMethod} method - The HTTP method (e.g., 'GET', 'POST').
     * @param {string} path - The route path (e.g., '/users/:id').
     * @param {RequestCallback} callback - The function to handle the route.
     * @param {Middleware[]} middlewares - An array of middleware functions to apply to the route.
     */
    const addRoute = (method: RequestMethod, path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        const pathRegex = pathToRegex(path);
        routes.push({ method, path, pathRegex, callback, middlewares });
    };


    /**
     * Registers a GET route with the specified path and callback function.
     *
     * @param path - The path for the GET route.
     * @param callback - The function to be called when the route is accessed.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const get = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('GET', path, callback, middlewares);
    }

    /**
     * Registers a new POST route with the specified path and callback function.
     *
     * @param path - The path for the POST route.
     * @param callback - The function to be called when the route is accessed.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const post = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('POST', path, callback, middlewares);
    }

    /**
     * Registers a new PATCH route with the specified path and callback function.
     *
     * @param path - The URL path for the PATCH route.
     * @param callback - The function to handle the PATCH request.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const patch = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('PATCH', path, callback, middlewares);
    }

    /**
     * Registers a DELETE route with the specified path and callback function.
     *
     * @param path - The path for the DELETE route.
     * @param callback - The callback function to handle the DELETE request.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const del = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('DELETE', path, callback, middlewares);
    }


    /**
     * Registers a PUT route with the specified path and callback function.
     *
     * @param path - The path for the PUT route.
     * @param callback - The function to be executed when the route is accessed.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const put = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('PUT', path, callback, middlewares);
    }

    /**
     * Handles an incoming HTTP request and returns an appropriate response.
     *
     * @param {Request} req - The incoming HTTP request object.
     * @returns {Promise<Response>} - A promise that resolves to an HTTP response object.
     *
     * The function extracts the HTTP method and URL from the request, logs them along with the available routes,
     * and attempts to match the request to a route. If a matching route is found, it constructs a `RequestEvent`
     * object containing the request details, including headers, parameters, and query string.
     *
     * Depending on the `Content-Type` header of the request, the function processes the request body accordingly:
     * - For `application/json`, it parses the body as JSON.
     * - For `application/x-www-form-urlencoded` and `multipart/form-data`, it parses the body as form data.
     *
     * The function then calls the handler associated with the matched route, passing the `RequestEvent` object.
     * If the handler throws an error, the function logs the error and returns a 500 Internal Server Error response.
     * If no matching route is found, it logs a 404 Not Found message and returns a 404 Not Found response.
     *
     * @throws {Error} - If an error occurs while handling the request.
     */
    const fetch = async (req: Request): Promise<Response> => {
        const { method, url } = req;

        logger(`Incoming request: ${method} ${url}`);

        const route: RouteMatch | null = matchRoute(method as RequestMethod, url, routes);

        if (route) {
            const clientIp = server?.requestIP(req)?.toString();
            const event: RequestEvent = {
                url,
                method: method as RequestMethod,
                request: req,
                params: route.params,
                query: route.query,
                clientIp,
                locals,
            };

            const applyMiddlewares = async (middlewares: Middleware[], index: number): Promise<Response> => {
                if (index < middlewares.length) {
                    return middlewares[index](event, () => applyMiddlewares(middlewares, index + 1));
                } else {
                    return route.handler(event);
                }
            };

            try {
                const allMiddlewares = [...globalMiddlewares, ...route.middlewares];
                return await applyMiddlewares(allMiddlewares, 0);
            } catch (error) {
                logger(`Error handling request: ${error}`);
                return new Response("Internal Server Error", { status: 500 });
            }
        }

        logger(`404 Not Found: ${method} ${url}`);
        return new Response("Not Found", { status: 404 });
    }




    /**
     * Stops the server if it is running.
     * 
     * This function checks if the `server` object exists and, if so, calls its `stop` method to halt the server.
     */
    const stop = () => server && server.stop();

    const listen = (port: number = 5000, callback?: () => void) => {
        logger(`Server is listening on port ${port}`);

        server = Bun.serve({
            port,
            fetch,
        });

        typeof callback === 'function' && callback();
    };

    return {
        version: Lizard.version,
        locals,
        use,
        get,
        post,
        patch,
        del,
        put,
        listen,
        stop,
    }
}

class Lizard {
    static version: LizardVersion = '1.0.0';

    static create(): LizardApp {
        return createContext();
    }
}

export default Lizard;
