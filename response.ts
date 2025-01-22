/**
 * A builder class for constructing HTTP responses.
 */
class ResponseBuilder {
    /**
     * The HTTP status code of the response.
     */
    public statusCode: number;

    /**
     * The HTTP status text of the response.
     */
    public statusText: string;

    /**
     * The HTTP headers of the response.
     */
    public headers: Headers;

    /**
     * Constructs a new ResponseBuilder with default values.
     */
    constructor() {
        this.statusCode = 200;
        this.statusText = 'OK';
        this.headers = new Headers();
    }

    /**
     * Sets the status text of the response.
     * @param text - The status text to set.
     * @returns The current instance of ResponseBuilder.
     */
    setStatusText(text: string): ResponseBuilder {
        if (!text) {
            throw new Error('Status text cannot be empty');
        }
        this.statusText = text;
        return this;
    }

    /**
     * Sets the status code of the response.
     * @param code - The status code to set.
     * @returns The current instance of ResponseBuilder.
     */
    status(code: number): ResponseBuilder {
        if (code < 100 || code > 599) {
            throw new Error('Invalid status code');
        }
        this.statusCode = code;
        return this;
    }

    /**
     * Sets a header for the response.
     * @param key - The header key.
     * @param value - The header value.
     * @returns The current instance of ResponseBuilder.
     */
    header(key: string, value: string): ResponseBuilder {
        if (!key || !value) {
            throw new Error('Header key and value cannot be empty');
        }
        this.headers.set(key, value);
        return this;
    }

    /**
     * Constructs a JSON response.
     * @param data - The data to include in the response body.
     * @returns A Response object with the specified JSON data.
     */
    json(data: unknown): Response {
        this.headers.set('Content-Type', 'application/json');
        return new Response(JSON.stringify(data), { status: this.statusCode, headers: this.headers });
    }

    /**
     * Constructs a plain text response.
     * @param data - The data to include in the response body.
     * @returns A Response object with the specified plain text data.
     */
    send(data: string): Response {
        return new Response(data, { status: this.statusCode, headers: this.headers });
    }

    /**
     * Constructs an HTML response.
     * @param data - The data to include in the response body.
     * @returns A Response object with the specified HTML data.
     */
    html(data: string): Response {
        this.headers.set('Content-Type', 'text/html');
        return new Response(data, { status: this.statusCode, headers: this.headers });
    }

    /**
     * Constructs a plain text response.
     * @param data - The data to include in the response body.
     * @returns A Response object with the specified plain text data.
     */
    text(data: string): Response {
        this.headers.set('Content-Type', 'text/plain');
        return new Response(data, { status: this.statusCode, headers: this.headers });
    }
}

export default ResponseBuilder;