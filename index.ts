import Lizard from "./lizard";

const app = Lizard.create();

app.get('/', async (event) => {
	return new Response("Home Page", { status: 200 });
});

app.get('/home', async (event) => {
	return new Response("Home Page", { status: 200 });
});

app.get('/home/:id', async (event) => {
	return new Response("Home Page" + event.params?.id, { status: 200 });
});

app.get('/home/:id', async (event) => {
	return new Response(`User ${event.params?.id}`, { status: 200 });
});

app.get('/home/:id', async (event) => {
	return new Response(`User ${event.params?.id}`, { status: 200 });
});

app.get('/home/:id/profile', async (event) => {
	return new Response(`User ${event.params?.id} Profile`, { status: 200 });
});

app.post('/user', async (event) => {
	return new Response("User Created", { status: 200 });
});

app.put('/user/:id', async (event) => {
	return new Response(`User ${event.params?.id} Updated`, { status: 200 });
});

app.del('/user/:id', async (event) => {
	return new Response(`User ${event.params?.id} Deleted`, { status: 200 });
});


app.listen(3000);