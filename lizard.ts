import Bun from 'bun'
import type { LizardApp, LizardVersion, RequestCallback, RequestEvent, RequestMethod, Route } from './types';
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
 * - `get(path: string, callback: RequestCallback): void`: Registers a GET route.
 * - `post(path: string, callback: RequestCallback): void`: Registers a POST route.
 * - `patch(path: string, callback: RequestCallback): void`: Registers a PATCH route.
 * - `del(path: string, callback: RequestCallback): void`: Registers a DELETE route.
 * - `put(path: string, callback: RequestCallback): void`: Registers a PUT route.
 * - `listen(port: number = 5000, callback?: () => void): void`: Starts the server on the specified port.
 * - `stop(): void`: Stops the server if it is running.
 */
const createContext = (): LizardApp => {
    const routes: Route[] = [];

    const logger = (message: string) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    };


    /**
     * Registers a new route.
     * @param {RequestMethod} method - The HTTP method (e.g., 'GET', 'POST').
     * @param {string} path - The route path (e.g., '/users/:id').
     * @param {RequestCallback} callback - The function to handle the route.
     */
    const addRoute = (method: RequestMethod, path: string, callback: RequestCallback): void => {
        const pathRegex = pathToRegex(path);
        routes.push({ method, path, pathRegex, callback });
    };

    
    /**
     * Registers a GET route with the specified path and callback function.
     *
     * @param path - The path for the GET route.
     * @param callback - The function to be called when the route is accessed.
     */
    const get = (path: string, callback: RequestCallback): void => {
        addRoute('GET', path, callback);
    }

    /**
     * Registers a new POST route with the specified path and callback function.
     *
     * @param path - The path for the POST route.
     * @param callback - The function to be called when the route is accessed.
     */
    const post = (path: string, callback: RequestCallback): void => {
        addRoute('POST', path, callback);
    }

    /**
     * Registers a new PATCH route with the specified path and callback function.
     *
     * @param path - The URL path for the PATCH route.
     * @param callback - The function to handle the PATCH request.
     */
    const patch = (path: string, callback: RequestCallback): void => {
        addRoute('PATCH', path, callback);
    }

    /**
     * Registers a DELETE route with the specified path and callback function.
     *
     * @param path - The path for the DELETE route.
     * @param callback - The callback function to handle the DELETE request.
     */
    const del = (path: string, callback: RequestCallback): void => {
        addRoute('DELETE', path, callback);
    }
    

    /**
     * Registers a PUT route with the specified path and callback function.
     *
     * @param path - The path for the PUT route.
     * @param callback - The function to be executed when the route is accessed.
     */
    const put = (path: string, callback: RequestCallback): void => {
        addRoute('PUT', path, callback);
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

        const route = matchRoute(method as RequestMethod, url, routes);

        if (route) {
            const event: RequestEvent = {
                method: method as RequestMethod,
                url,
                headers: req.headers ?? {},
                params: route.params,
                query: route.query
            };

            const contentType = req.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                event.body = await req.json();
            } else if (contentType?.includes('application/x-www-form-urlencoded')) {
                const formData = await req.formData();
                event.body = Object.fromEntries((formData as any).entries());
            } else if (contentType?.includes('multipart/form-data')) {
                const formData = await req.formData();
                event.body = Object.fromEntries((formData as any).entries());
            }

            try {
                return await route.handler(event);
            } catch (error) {
                logger(`Error handling request: ${error}`);
                return new Response("Internal Server Error", { status: 500 });
            }
        }

        logger(`404 Not Found: ${method} ${url}`);
        return new Response("Not Found", { status: 404 });
    }

    let server: ReturnType<typeof Bun.serve> | null = null;

    
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
