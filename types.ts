import pathToReg from 'path-to-regexp';

import type ResponseBuilder from './response';

export type LizardVersion = `${number}.${number}.${number}`;

export type LizardApp = {
    version: LizardVersion;
    locals: Map<string, unknown>;
    configs: Map<string, unknown>;
    config: (newConfigs: Record<string, unknown>) => void;
    listen: (port: number, callback?: () => void) => void;
    get: (route: string, callback: RequestCallback, middlewares?: Middleware[]) => void;
    post: (route: string, callback: RequestCallback, middlewares?: Middleware[]) => void;
    patch: (route: string, callback: RequestCallback, middlewares?: Middleware[]) => void;
    del: (route: string, callback: RequestCallback, middlewares?: Middleware[]) => void;
    put: (route: string, callback: RequestCallback, middlewares?: Middleware[]) => void;
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
    response: ResponseBuilder;
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