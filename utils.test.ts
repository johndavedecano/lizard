import { describe, it, expect } from 'bun:test'
import { pathToRegex, parseUrl, matchRoute, parseQuery } from './utils'
import type { Route } from './types'

describe('pathToRegex', () => {
    it('should convert a route path to a regular expression', () => {
        const regex = pathToRegex('/test/:id')
        expect(regex.regexp.test('/test/123')).toBe(true)
        expect(regex.regexp.test('/test/abc')).toBe(true)
        expect(regex.regexp.test('/test/')).toBe(false)
    })

    it('should handle paths with no parameters', () => {
        const regex = pathToRegex('/test')
        expect(regex.regexp.test('/test')).toBe(true)
        expect(regex.regexp.test('/test/123')).toBe(false)
    })

    it('should handle paths with multiple parameters', () => {
        const regex = pathToRegex('/test/:id/:name')
        expect(regex.regexp.test('/test/123/abc')).toBe(true)
        expect(regex.regexp.test('/test/123')).toBe(false)
    })

    it('should handle paths with optional parameters', () => {
        const regex = pathToRegex('/test/:id')
        expect(regex.regexp.test('/test')).toBe(false)
        expect(regex.regexp.test('/test/123')).toBe(true)
    })
})

describe('parseUrl', () => {
    it('should parse a URL string and return a URL object', () => {
        const url = parseUrl('http://example.com/path?name=value')
        expect(url).toBeInstanceOf(URL)
        expect(url.hostname).toBe('example.com')
        expect(url.pathname).toBe('/path')
        expect(url.search).toBe('?name=value')
    })

    it('should handle URLs with no query string', () => {
        const url = parseUrl('http://example.com/path')
        expect(url).toBeInstanceOf(URL)
        expect(url.hostname).toBe('example.com')
        expect(url.pathname).toBe('/path')
        expect(url.search).toBe('')
    })

    it('should handle URLs with no path', () => {
        const url = parseUrl('http://example.com')
        expect(url).toBeInstanceOf(URL)
        expect(url.hostname).toBe('example.com')
        expect(url.pathname).toBe('/')
        expect(url.search).toBe('')
    })

    it('should handle URLs with no protocol', () => {
        const url = parseUrl('example.com/path?name=value')
        expect(url).toBeInstanceOf(URL)
        expect(url.hostname).toBe('example.com')
        expect(url.pathname).toBe('/path')
        expect(url.search).toBe('?name=value')
    })
})

describe('matchRoute', () => {
    const routes: Route[] = []

    const pathRegex = pathToRegex('/users/:id')

    routes.push({ method: 'GET', path: '/users/123', pathRegex, callback: async () => new Response(), middlewares: [] })

    it('should match a request to the registered routes', () => {
        const match = matchRoute('GET', 'http://example.com/users/123', routes)
        expect(match).not.toBeNull()
        expect(match?.params).toEqual({ id: '123' })
        expect(match?.query).toEqual({})
    })

    it('should return null if no match is found', () => {
        const match = matchRoute('POST', 'http://example.com/users/123', routes)
        expect(match).toBeNull()
    })

    it('should parse query parameters from the URL', () => {
        const match = matchRoute('GET', 'http://example.com/users/123?name=value', routes)
        expect(match).not.toBeNull()
        expect(match?.query).toEqual({ name: 'value' })
    })

    it('should return an empty object for query parameters if none are present', () => {
        const match = matchRoute('GET', 'http://example.com/users/123', routes)
        expect(match).not.toBeNull()
        expect(match?.query).toEqual({})
    })
})

describe('parseQuery', () => {
    it('should parse a query string into an object', () => {
        const query = parseQuery('name=value&key=123')
        expect(query).toEqual({ name: 'value', key: '123' })
    })

    it('should return an empty object if the query string is empty', () => {
        const query = parseQuery('')
        expect(query).toEqual({})
    })

    it('should handle URL-encoded characters', () => {
        const query = parseQuery('name=hello%20world&key=123')
        expect(query).toEqual({ name: 'hello world', key: '123' })
    })

    it('should handle special characters', () => {
        const query = parseQuery('name=hello%20world&key=123&%24special=%40%23%24')
        expect(query).toEqual({ name: 'hello world', key: '123', $special: '@#$' })
    })
})
