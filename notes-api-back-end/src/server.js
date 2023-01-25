require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

// notes
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesService');
const NotesValidator = require('./validator/notes');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
	const cacheService = new CacheService();
	const collaborationsServices = new CollaborationsService(cacheService);
	const notesServices = new NotesService(collaborationsServices, cacheService);
	const usersServices = new UsersService();
	const authenticationsServices = new AuthenticationsService();
	const storageServices = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
		routes: {
			cors: {
				origin: ['*'],
			},
		},
	});

	await server.register([
		{
			plugin: Jwt,
		},
		{
			plugin: Inert,
		},
	]);

	// mendefinisikan strategy autentikasi jwt
	server.auth.strategy('notesapp_jwt', 'jwt', {
		keys: process.env.ACCESS_TOKEN_KEY,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: process.env.ACCESS_TOKEN_AGE,
		},
		validate: (artifacts) => ({
			isValid: true,
			credentials: {
				id: artifacts.decoded.payload.id,
			},
		}),
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

	await server.register({
		plugin: authentications,
		options: {
			authenticationsService: authenticationsServices,
			usersService: usersServices,
			tokenManager: TokenManager,
			validator: AuthenticationsValidator,
		},
	});

	await server.register({
		plugin: collaborations,
		options: {
			collaborationsServices: collaborationsServices,
			notesServices: notesServices,
			validator: CollaborationsValidator,
		},
	});

	await server.register({
		plugin: _exports,
		options: {
			service: ProducerService,
			validator: ExportsValidator,
		},
	});

	await server.register({
		plugin: uploads,
		options: {
			service: storageServices,
			validator: UploadsValidator,
		},
	});

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
