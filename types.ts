import pathToReg from 'path-to-regexp';

export type LizardVersion = `${number}.${number}.${number}`;

export type LizardApp = {
    version: LizardVersion;
    listen: (port: number, callback?: () => void) => void;
    get: (route: string, callback: RequestCallback) => void;
    post: (route: string, callback: RequestCallback) => void;
    patch: (route: string, callback: RequestCallback) => void;
    del: (route: string, callback: RequestCallback) => void;
    put: (route: string, callback: RequestCallback) => void;
    stop: () => void;
}

export type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

export type RequestEvent = {
    method: RequestMethod;
    url: string;
    headers?: Headers;
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
    params?: Record<string, unknown>;
    files?: Record<string, File>;
}

export type RequestCallback<T = Response> = (event: RequestEvent) => Promise<T>

export type RouteRegexType = ReturnType<typeof pathToReg.pathToRegexp>

export type Route = {
    method: RequestMethod;
    path: string;
    pathRegex: RouteRegexType;
    callback: RequestCallback;
};
