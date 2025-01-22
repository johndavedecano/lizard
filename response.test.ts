import { describe, it, expect } from 'bun:test'
import ResponseBuilder from './response'

describe('ResponseBuilder', () => {
    it('should set default values in the constructor', () => {
        const builder = new ResponseBuilder()
        expect(builder.statusCode).toBe(200)
        expect(builder.statusText).toBe('OK')
        expect(builder.headers).toBeInstanceOf(Headers)
    })

    it('should set the status text', () => {
        const builder = new ResponseBuilder()
        builder.setStatusText('Created')
        expect(builder.statusText).toBe('Created')
    })

    it('should throw an error when setting an empty status text', () => {
        const builder = new ResponseBuilder()
        expect(() => builder.setStatusText('')).toThrow('Status text cannot be empty')
    })

    it('should set the status code', () => {
        const builder = new ResponseBuilder()
        builder.status(201)
        expect(builder.statusCode).toBe(201)
    })

    it('should throw an error when setting an invalid status code', () => {
        const builder = new ResponseBuilder()
        expect(() => builder.status(99)).toThrow('Invalid status code')
        expect(() => builder.status(600)).toThrow('Invalid status code')
    })

    it('should set a header', () => {
        const builder = new ResponseBuilder()
        builder.header('Content-Type', 'application/json')
        expect(builder.headers.get('Content-Type')).toBe('application/json')
    })

    it('should throw an error when setting an empty header key or value', () => {
        const builder = new ResponseBuilder()
        expect(() => builder.header('', 'value')).toThrow('Header key and value cannot be empty')
        expect(() => builder.header('key', '')).toThrow('Header key and value cannot be empty')
    })

    it('should construct a JSON response', () => {
        const builder = new ResponseBuilder()
        const response = builder.json({ message: 'Hello, world!' })
        expect(response.headers.get('Content-Type')).toBe('application/json')
        expect(response.status).toBe(200)
    })

    it('should construct a plain text response', () => {
        const builder = new ResponseBuilder()
        const response = builder.send('Hello, world!')
        expect(response.status).toBe(200)
    })

    it('should construct an HTML response', () => {
        const builder = new ResponseBuilder()
        const response = builder.html('<p>Hello, world!</p>')
        expect(response.headers.get('Content-Type')).toBe('text/html')
        expect(response.status).toBe(200)
    })

    it('should construct a plain text response with text method', () => {
        const builder = new ResponseBuilder()
        const response = builder.text('Hello, world!')
        expect(response.headers.get('Content-Type')).toBe('text/plain')
        expect(response.status).toBe(200)
    })
})
