import Lizard from './lizard'
import type { Middleware } from './types'

const app = Lizard.create()

// Global middleware to log requests
const loggerMiddleware: Middleware = async (event, next) => {
    console.log(`Request: ${event.method} ${event.url}`)
    return next()
}

// Global middleware to add a custom header
const headerMiddleware: Middleware = async (event, next) => {
    event.response.headers.set('X-Custom-Header', 'Lizard')
    return next()
}

// Apply global middlewares
app.use(loggerMiddleware)
app.use(headerMiddleware)

app.get('/', async event => {
    return event.response.send('Hello, World!')
})

app.get('/home', async event => {
    return event.response.send('Home Page')
})

app.get('/home/:id', async event => {
    return event.response.send('Home Page' + event.params?.id)
})

app.get('/home/:id', async event => {
    return event.response.send(`User ${event.params?.id}`)
})

app.get('/home/:id', async event => {
    return event.response.send(`User ${event.params?.id}`)
})

app.get('/home/:id/profile', async event => {
    return event.response.send(`User ${event.params?.id} Profile`)
})

app.post('/user', async event => {
    return event.response.send('User Created')
})

app.put('/user/:id', async event => {
    return event.response.send(`User ${event.params?.id} Updated`)
})

app.del('/user/:id', async event => {
    return event.response.send(`User ${event.params?.id} Deleted`)
})

app.listen(3000)
