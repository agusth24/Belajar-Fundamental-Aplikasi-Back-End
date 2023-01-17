require('dotenv').config();
const Hapi = require('@hapi/hapi');

// notes
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesService');
const NotesValidator = require('./validator/notes');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const init = async () => {
	const notesServices = new NotesService();
	const usersServices = new UsersService();

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
		routes: {
			cors: {
				origin: ['*'],
			},
		},
	});

	await server.register({
		plugin: notes,
		options: {
			service: notesServices,
			validator: NotesValidator,
		},
	});

	await server.register({
		plugin: users,
		options: {
			service: usersServices,
			validator: UsersValidator,
		},
	});

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
