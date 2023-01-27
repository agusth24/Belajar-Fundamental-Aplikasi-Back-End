const autoBind = require('auto-bind');

class PlaylistsHandler {
	constructor(service, validator) {
		this._service = service;
		this._validator = validator;

		autoBind(this);
	}

	async postPlaylistHandler(request, h) {
		this._validator.validatePlaylistPayload(request.payload);
		const {name = 'untitled'} = request.payload;
		const {id: credentialId} = request.auth.credentials;
		const playlistId = await this._service.addPlaylist(name, credentialId);
		const response = h.response({
			status: 'success',
			message: 'Playlist berhasil ditambahkan',
			data: {playlistId},
		});
		response.code(201);
		return response;
	};

	async getPlaylistsHandler(request) {
		const {id: credentialId} = request.auth.credentials;
		const playlists = await this._service.getPlaylists(credentialId);
		return {
			status: 'success',
			data: {playlists},
		};
	};

	async getPlaylistByIdHandler(request, h) {
		const {id} = request.params;
		const {id: credentialId} = request.auth.credentials;

		await this._service.verifyPlaylistAccess(id, credentialId);
		const playlist = await this._service.getPlaylistById(id);

		return {
			status: 'success',
			data: {playlist},
		};
	};

	async putPlaylistByIdHandler(request, h) {
		this._validator.validatePlaylistPayload(request.payload);
		const {id} = request.params;
		const {id: credentialId} = request.auth.credentials;

		await this._service.verifyPlaylistAccess(id, credentialId);
		await this._service.editPlaylistById(id, request.payload);
		return {
			status: 'success',
			message: 'Playlist berhasil diperbarui',
		};
	};

	async deletePlaylistByIdHandler(request, h) {
		const {id} = request.params;
		const {id: credentialId} = request.auth.credentials;

		await this._service.verifyPlaylistOwner(id, credentialId);
		await this._service.deletePlaylistById(id);
		return {
			status: 'success',
			message: 'Playlist berhasil dihapus',
		};
	};

	async postPlaylistSongHandler(request, h) {
		this._validator.validatePlaylistSongPayload(request.payload);
		const {songId} = request.payload;
		const {id} = request.params;
		const {id: credentialId} = request.auth.credentials;

		await this._service.verifyPlaylistAccess(id, credentialId);
		await this._service.verifySongPlaylist(songId);
		const playlistSongId = await this._service.addPlaylistSong(id, songId, credentialId);
		const response = h.response({
			status: 'success',
			message: 'Song Playlist berhasil ditambahkan',
			data: {playlistSongId},
		});
		response.code(201);
		return response;
	};

	async getPlaylistSongHandler(request, h) {
		const {id} = request.params;
		const {id: credentialId} = request.auth.credentials;

		await this._service.verifyPlaylistAccess(id, credentialId);
		const {playlist, state} = await this._service.getPlaylistSong(id);

		const response = h.response({
			status: 'success',
			data: {playlist},
		});
		if (state=='cache') {
			response.header('X-Data-Source', 'cache');
		}
		return response;
	};

	async deletePlaylistSongByIdHandler(request, h) {
		this._validator.validatePlaylistSongPayload(request.payload);
		const {songId} = request.payload;
		const {id} = request.params;
		const {id: credentialId} = request.auth.credentials;

		await this._service.verifyPlaylistAccess(id, credentialId);
		await this._service.deletePlaylistSongById(id, songId, credentialId);
		return {
			status: 'success',
			message: 'Song Playlist berhasil dihapus',
		};
	};

	async getPlaylistSongActivitiesHandler(request, h) {
		const {id} = request.params;
		const {id: credentialId} = request.auth.credentials;

		await this._service.verifyPlaylistAccess(id, credentialId);
		const activities = await this._service.getPlaylistSongActivities(id);

		return {
			status: 'success',
			data: {playlistId: id, activities: activities},
		};
	};
}


module.exports = PlaylistsHandler;
