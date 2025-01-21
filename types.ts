import pathToReg from 'path-to-regexp';

export type LizardVersion = `${number}.${number}.${number}`;

export type LizardApp = {
    version: LizardVersion;
    locals: Map<string, unknown>;
    listen: (port: number, callback?: () => void) => void;
    get: (route: string, callback: RequestCallback) => void;
    post: (route: string, callback: RequestCallback) => void;
    patch: (route: string, callback: RequestCallback) => void;
    del: (route: string, callback: RequestCallback) => void;
    put: (route: string, callback: RequestCallback) => void;
    stop: () => void;
    use: (middleware: Middleware) => void;
}

export type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

export type RequestEvent = {
    url: string;
    method: RequestMethod;
    request: Request;
    headers?: Headers;
    params?: Record<string, string>;
    query?: Record<string, string>;
    clientIp?: string;
    locals: Map<string, unknown>;

}

export type RequestCallback<T = Response> = (event: RequestEvent) => Promise<T>

export type RouteRegexType = ReturnType<typeof pathToReg.pathToRegexp>

export type Middleware = (event: RequestEvent, next: () => Promise<Response>) => Promise<Response> | Response;

export type Route = {
    method: RequestMethod;
    path: string;
    pathRegex: RouteRegexType;
    callback: RequestCallback;
    middlewares: Middleware[];
};

export type RouteMatch = { params: Record<string, string>, handler: RequestCallback, query: Record<string, string>, middlewares: Middleware[] }