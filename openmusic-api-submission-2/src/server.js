require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

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

const init = async () => {
	const albumsServices = new AlbumsService();
	const songsServices = new SongsService();
	const usersServices = new UsersService();
	const authenticationsServices = new AuthenticationsService();
	const collaborationsServices = new CollaborationsService(usersServices);
	const playlistsServices = new PlaylistsService(collaborationsServices, songsServices);

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
	]);

	// mendefinisikan strategy autentikasi jwt
	server.auth.strategy('openmusic_jwt', 'jwt', {
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
		plugin: albums,
		options: {
			service: albumsServices,
			validator: AlbumsValidator,
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
