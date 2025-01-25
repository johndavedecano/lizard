import Bun from 'bun'
import type {
    LizardApp,
    LizardVersion,
    Middleware,
    RequestCallback,
    RequestEvent,
    RequestMethod,
    Route,
    RouteMatch,
} from './types'
import { matchRoute, pathToRegex } from './utils'
import ResponseBuilder from './response'

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
 * - `configs`: A map of configuration values that can be set using the `config` method.
 * - `config(newConfigs: Record<string, unknown>): void`: Merges the provided configuration object into the configs map.
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
    let server: ReturnType<typeof Bun.serve> | null = null

    const routes: Route[] = []

    const globalMiddlewares: Middleware[] = []

    const locals = new Map<string, unknown>()

    const configs = new Map<string, unknown>()

    /**
     * Logs a message with a timestamp.
     *
     * @param message - The message to log.
     */
    const logger = (message: string) => {
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] ${message}`)
    }

    /**
     * Merges the provided configuration object into the configs map.
     *
     * This function accepts an object with only uppercase keys and unknown values,
     * and merges its properties into the existing configs map.
     *
     * @param {Record<string, unknown>} newConfigs - The configuration object to be merged.
     * @throws {Error} If any key in the newConfigs object is not uppercase.
     */
    const config = (newConfigs: Record<string, unknown>): void => {
        for (const key in newConfigs) {
            if (key !== key.toUpperCase()) {
                throw new Error(`Config key "${key}" must be uppercase.`)
            }
            configs.set(key, newConfigs[key])
        }
    }

    /**
     * Adds a middleware function to the global middlewares array.
     *
     * @param middleware - The middleware function to be added.
     */
    const use = (middleware: Middleware): void => {
        globalMiddlewares.push(middleware)
    }

    /**
     * Registers a new route.
     * @param {RequestMethod} method - The HTTP method (e.g., 'GET', 'POST').
     * @param {string} path - The route path (e.g., '/users/:id').
     * @param {RequestCallback} callback - The function to handle the route.
     * @param {Middleware[]} middlewares - An array of middleware functions to apply to the route.
     */
    const addRoute = (
        method: RequestMethod,
        path: string,
        callback: RequestCallback,
        middlewares: Middleware[] = []
    ): void => {
        const pathRegex = pathToRegex(path)
        routes.push({ method, path, pathRegex, callback, middlewares })
    }

    /**
     * Registers a GET route with the specified path and callback function.
     *
     * @param path - The path for the GET route.
     * @param callback - The function to be called when the route is accessed.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const get = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('GET', path, callback, middlewares)
    }

    /**
     * Registers a new POST route with the specified path and callback function.
     *
     * @param path - The path for the POST route.
     * @param callback - The function to be called when the route is accessed.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const post = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('POST', path, callback, middlewares)
    }

    /**
     * Registers a new PATCH route with the specified path and callback function.
     *
     * @param path - The URL path for the PATCH route.
     * @param callback - The function to handle the PATCH request.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const patch = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('PATCH', path, callback, middlewares)
    }

    /**
     * Registers a DELETE route with the specified path and callback function.
     *
     * @param path - The path for the DELETE route.
     * @param callback - The callback function to handle the DELETE request.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const del = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('DELETE', path, callback, middlewares)
    }

    /**
     * Registers a PUT route with the specified path and callback function.
     *
     * @param path - The path for the PUT route.
     * @param callback - The function to be executed when the route is accessed.
     * @param middlewares - An array of middleware functions to apply to the route.
     */
    const put = (path: string, callback: RequestCallback, middlewares: Middleware[] = []): void => {
        addRoute('PUT', path, callback, middlewares)
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
        const { method, url } = req

        logger(`Incoming request: ${method} ${url}`)

        const route: RouteMatch | null = matchRoute(method as RequestMethod, url, routes)

        const response = new ResponseBuilder()

        if (route) {
            const clientIp = server?.requestIP(req)?.toString()
            const event: RequestEvent = {
                url,
                method: method as RequestMethod,
                request: req,
                params: route.params,
                query: route.query,
                clientIp,
                locals,
                configs,
                response,
            }

            const applyMiddlewares = async (middlewares: Middleware[], index: number): Promise<Response> => {
                if (index < middlewares.length) {
                    return middlewares[index](event, () => applyMiddlewares(middlewares, index + 1))
                } else {
                    return route.handler(event)
                }
            }

            try {
                const allMiddlewares = [...globalMiddlewares, ...route.middlewares]
                return await applyMiddlewares(allMiddlewares, 0)
            } catch (error) {
                logger(`Error handling request: ${error}`)
                return event.response.status(500).send('Internal Server Error')
            }
        }

        logger(`404 Not Found: ${method} ${url}`)
        return response.status(404).send('Not Found')
    }

    /**
     * Stops the server if it is running.
     *
     * This function checks if the `server` object exists and, if so, calls its `stop` method to halt the server.
     */
    const stop = () => server && server.stop()

    /**
     * Checks if the application is running in development mode.
     *
     * @returns {boolean} - `true` if the application is running in development mode; otherwise, `false
     */
    const isDevelopment = (): boolean => {
        return process.env.NODE_ENV === 'development' || configs.get('NODE_ENV') === 'development'
    }

    /**
     * Starts the server and listens on the specified port.
     *
     * @param {number} [port=5000] - The port number on which the server should listen. Defaults to 5000 if not provided.
     * @param {() => void} [callback] - An optional callback function that is invoked once the server starts listening.
     */
    const listen = (port?: number, callback?: () => void) => {
        logger(`Server is listening on port ${port}`)

        if (!port) port = (configs.get('PORT') as number) ?? 5000

        const development = isDevelopment()

        server = Bun.serve({
            development,
            port,
            fetch,
        })

        typeof callback === 'function' && callback()
    }

    return {
        version: Lizard.version,
        locals,
        configs,
        config,
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
    static version: LizardVersion = '1.0.0'

    static create(config?: Record<string, unknown>): LizardApp {
        const context = createContext()

        if (config) context.config(config)

        return context
    }
}

export default Lizard
