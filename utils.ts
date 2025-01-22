import type { RequestMethod, Route, RouteMatch, RouteRegexType } from './types'

import pathToReg from 'path-to-regexp'

/**
 * Converts a route path to a regular expression.
 * @param {string} path - The route path.
 * @returns {RegExp} - A regular expression to match the route.
 */
export const pathToRegex = (path: string): RouteRegexType => {
    return pathToReg.pathToRegexp(path)
}

/**
 * Parses a URL string and returns a URL object.
 * @param {string} url - The URL string to parse.
 * @returns {URL} - The parsed URL object.
 */
export const parseUrl = (url: string): URL => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}` // Add a protocol if one is
    }
    return new URL(url, 'http://dummy-base') // Use a dummy base to ensure the URL is parsed correctly
}

/**
 * Matches a request to the registered routes.
 * @param {string} method - The HTTP method of the request.
 * @param {string} url - The URL of the request.
 * @param {Route[]} routes - The registered routes.
 * @returns {object|null} - The matched route, or null if no match.
 */
export const matchRoute = (method: RequestMethod, url: string, routes: Route[]): RouteMatch | null => {
    const urlObj = parseUrl(url)
    const path = urlObj.pathname
    const queryString = urlObj.search.slice(1) // Remove the leading '?'

    for (const route of routes) {
        if (route.method === method) {
            const match = route.pathRegex.regexp.exec(path)
            const params = match?.slice(1).reduce((acc, value, index) => {
                const key = route.pathRegex.keys[index]
                if (key) {
                    acc[key.name] = value
                }
                return acc
            }, {} as Record<string, string>)

            if (match) {
                return {
                    params: params || {},
                    handler: route.callback,
                    query: queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {},
                    middlewares: route.middlewares ?? [],
                }
            }
        }
    }
    return null
}

/**
 * Parses a query string into an object.
 * @param {string} queryString - The query string from the URL.
 * @returns {object} - An object representing the query parameters.
 */
export const parseQuery = (queryString: string): Record<string, string> => {
    return queryString
        ? Object.fromEntries(queryString.split('&').map(pair => pair.split('=').map(decodeURIComponent)))
        : {}
}
