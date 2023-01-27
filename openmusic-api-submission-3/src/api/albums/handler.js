const autoBind = require('auto-bind');
const config = require('../../utils/config');

class AlbumsHandler {
	constructor(albumsService, storageService, albumsValidator, uploadValidator) {
		this._albumsService = albumsService;
		this._albumsValidator = albumsValidator;
		this._storageService = storageService;
		this._uploadValidator = uploadValidator;

		autoBind(this);
	}

	async postAlbumHandler(request, h) {
		this._albumsValidator.validateAlbumPayload(request.payload);
		const albumId = await this._albumsService.addAlbum(request.payload);
		const response = h.response({
			status: 'success',
			message: 'Album berhasil ditambahkan',
			data: {albumId},
		});
		response.code(201);
		return response;
	};

	async getAlbumsHandler() {
		const albums = await this._albumsService.getAlbums();
		return {
			status: 'success',
			data: {albums},
		};
	};

	async getAlbumByIdHandler(request) {
		const {id} = request.params;

		const album = await this._albumsService.getAlbumById(id);

		return {
			status: 'success',
			data: {album},
		};
	};

	async putAlbumByIdHandler(request) {
		this._albumsValidator.validateAlbumPayload(request.payload);
		const {id} = request.params;
		await this._albumsService.editAlbumById(id, request.payload);
		return {
			status: 'success',
			message: 'Album berhasil diperbaharui',
		};
	};

	async deleteAlbumByIdHandler(request) {
		const {id} = request.params;
		await this._albumsService.deleteAlbumById(id);
		return {
			status: 'success',
			message: 'Album berhasil dihapus',
		};
	};

	async postAlbumCoverHandler(request, h) {
		const {cover} = request.payload;
		const {id} = request.params;
		this._uploadValidator.validateImageHeaders(cover.hapi.headers);

		const filename = await this._storageService.writeFile(cover, cover.hapi);
		const coverUrl = `http://${config.app.host}:${config.app.port}/albums/covers/${filename}`;
		await this._albumsService.editAlbumCoverById(id, coverUrl);

		const response = h.response({
			status: 'success',
			message: 'Cover album berhasil ditambahkan',
			data: {
				fileLocation: coverUrl,
			},
		});
		response.code(201);
		return response;
	};

	async postAlbumLikeHandler(request, h) {
		const {id: credentialId} = request.auth.credentials;
		const {id} = request.params;

		const verifyUserAlbumLike = await this._albumsService.verifyUserAlbumLike(credentialId, id);
		let albumLikeId = '';
		let message = '';
		if (verifyUserAlbumLike) {
			albumLikeId = await this._albumsService.addUserAlbumLike(credentialId, id);
			message = 'Album like berhasil ditambahkan';
		} else {
			albumLikeId = await this._albumsService.deleteUserAlbumLike(credentialId, id);
			message = 'Album like berhasil dihapus';
		}

		const response = h.response({
			status: 'success',
			message: message,
			data: {
				albumLikeId,
			},
		});
		response.code(201);
		return response;
	}

	async getAlbumLikeHandler(request, h) {
		const {id} = request.params;

		const {likes, state} = await this._albumsService.getALbumLike(id);
		const response = h.response({
			status: 'success',
			data: {likes},
		});
		if (state=='cache') {
			response.header('X-Data-Source', 'cache');
		}
		return response;
	}
}


module.exports = AlbumsHandler;
