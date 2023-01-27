require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const config = require('./utils/config');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validators/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validators/songs');
const ClientError = require('./exceptions/ClientError');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validators/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validators/authentications');

// collaboratio
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validators/collaborations');

// playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validators/playlists');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validators/exports');

// uploads
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validators/uploads');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
	const usersServices = new UsersService();
	const cacheService = new CacheService();
	const albumsServices = new AlbumsService(usersServices, cacheService);
	const songsServices = new SongsService();
	const authenticationsServices = new AuthenticationsService();
	const collaborationsServices = new CollaborationsService(usersServices);
	const playlistsServices = new PlaylistsService(collaborationsServices, songsServices, cacheService);
	const storageServices = new StorageService(path.resolve(__dirname, 'api/albums/file/images'));

	const server = Hapi.server({
		port: config.app.port,
		host: config.app.host,
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
	server.auth.strategy('openmusic_jwt', 'jwt', {
		keys: config.token.access,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: config.token.age,
		},
		validate: (artifacts) => ({
			isValid: true,
			credentials: {
				id: artifacts.decoded.payload.id,
			},
		}),
	});

	await server.register({
		plugin: albums,
		options: {
			albumsService: albumsServices,
			storageService: storageServices,
			albumsValidator: AlbumsValidator,
			uploadValidator: UploadsValidator,
		},
	});

	await server.register({
		plugin: songs,
		options: {
			service: songsServices,
			validator: SongsValidator,
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
		plugin: playlists,
		options: {
			service: playlistsServices,
			validator: PlaylistsValidator,
		},
	});

	await server.register({
		plugin: collaborations,
		options: {
			collaborationsServices: collaborationsServices,
			playlistsServices: playlistsServices,
			validator: CollaborationsValidator,
		},
	});

	await server.register({
		plugin: _exports,
		options: {
			producerService: ProducerService,
			playlistsService: playlistsServices,
			validator: ExportsValidator,
		},
	});

	server.ext('onPreResponse', (request, h) => {
		// mendapatkan konteks response dari request
		const {response} = request;
		if (response instanceof Error) {
			// penanganan client error secara internal.
			if (response instanceof ClientError) {
				const newResponse = h.response({
					status: 'fail',
					message: response.message,
				});
				newResponse.code(response.statusCode);
				return newResponse;
			}
			// mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
			if (!response.isServer) {
				return h.continue;
			}
			// penanganan server error sesuai kebutuhan
			const newResponse = h.response({
				status: 'error',
				message: 'terjadi kegagalan pada server kami',
			});
			newResponse.code(500);
			return newResponse;
		}
		// jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
		return h.continue;
	});

	await server.start();
	console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
