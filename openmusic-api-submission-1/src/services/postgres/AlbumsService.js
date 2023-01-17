const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {mapAlbums} = require('../../utils/mapAlbums');

class AlbumsService {
	constructor() {
		this._pool = new Pool();
	}

	async addAlbum({name, year}) {
		const id = `album-${nanoid(16)}`;

		const query = {
			text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
			values: [id, name, year],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new InvariantError('Album gagal ditambahkan');
		}

		return result.rows[0].id;
	}

	async getAlbums() {
		const result = await this._pool.query('SELECT * FROM albums');
		return result.rows.map(mapAlbums);
	}

	async getAlbumById(id) {
		const queryAlbum = {
			text: 'SELECT * FROM albums WHERE id = $1',
			values: [id],
		};
		const resultAlbum = await this._pool.query(queryAlbum);
		if (!resultAlbum.rows.length) {
			throw new NotFoundError('Album tidak ditemukan');
		}
		const result = resultAlbum.rows.map(mapAlbums)[0];

		const querySong = {
			text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
			values: [id],
		};
		const resultSong = await this._pool.query(querySong);
		result.songs = (!resultSong.rows.length) ? [] : resultSong.rows;
		return result;
	}

	async editAlbumById(id, {name, year}) {
		const query = {
			text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
			values: [name, year, id],
		};
		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Gagal memperbarui album, ID tidak ditemukan');
		}
	}

	async deleteAlbumById(id) {
		const query = {
			text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
			values: [id],
		};
		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Album gagal dihapus. ID tidak ditemukan');
		}
	}
}

module.exports = AlbumsService;
