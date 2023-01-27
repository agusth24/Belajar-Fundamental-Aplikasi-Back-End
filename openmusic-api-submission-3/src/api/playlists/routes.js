const routes = (handler) => [{
	method: 'POST',
	path: '/playlists',
	handler: handler.postPlaylistHandler,
	options: {
		auth: 'openmusic_jwt',
	},
}, {
	method: 'GET',
	path: '/playlists',
	handler: handler.getPlaylistsHandler,
	options: {
		auth: 'openmusic_jwt',
	},
}, {
	method: 'GET',
	path: '/playlists/{id}',
	handler: handler.getPlaylistByIdHandler,
	options: {
		auth: 'openmusic_jwt',
	},
}, {
	method: 'PUT',
	path: '/playlists/{id}',
	handler: handler.putPlaylistByIdHandler,
	options: {
		auth: 'openmusic_jwt',
	},
}, {
	method: 'DELETE',
	path: '/playlists/{id}',
	handler: handler.deletePlaylistByIdHandler,
	options: {
		auth: 'openmusic_jwt',
	},
}, {
	method: 'POST',
	path: '/playlists/{id}/songs',
	handler: handler.postPlaylistSongHandler,
	options: {
		auth: 'openmusic_jwt',
	},
}, {
	method: 'GET',
	path: '/playlists/{id}/songs',
	handler: handler.getPlaylistSongHandler,
	options: {
		auth: 'openmusic_jwt',
	},
}, {
	method: 'DELETE',
	path: '/playlists/{id}/songs',
	handler: handler.deletePlaylistSongByIdHandler,
	options: {
		auth: 'openmusic_jwt',
	},
}, {
	method: 'GET',
	path: '/playlists/{id}/activities',
	handler: handler.getPlaylistSongActivitiesHandler,
	options: {
		auth: 'openmusic_jwt',
	},
}];

module.exports = routes;
