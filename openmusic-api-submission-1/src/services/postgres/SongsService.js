const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {mapSongs} = require('../../utils/mapSongs');

class SongsService {
	constructor() {
		this._pool = new Pool();
	}

	async addSong({title, year, genre, performer, duration, albumId}) {
		const id = `song-${nanoid(16)}`;

		const query = {
			text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
			values: [id, title, year, genre, performer, duration, albumId],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new InvariantError('Song gagal ditambahkan');
		}

		return result.rows[0].id;
	}

	async getSongs(title, performer) {
		let query = '';
		if (title !== undefined && performer !== undefined) {
			query = {
				text: 'SELECT id, title, performer FROM songs WHERE lower(title) LIKE $1 AND lower(performer) LIKE $2',
				values: ['%' + title + '%', '%' + performer + '%'],
			};
		} else if (title !== undefined) {
			query = {
				text: 'SELECT id, title, performer FROM songs WHERE lower(title) LIKE $1',
				values: ['%' + title + '%'],
			};
		} else if (performer !== undefined) {
			query = {
				text: 'SELECT id, title, performer FROM songs WHERE lower(performer) LIKE $1',
				values: ['%' + performer + '%'],
			};
		} else {
			query = {
				text: 'SELECT id, title, performer FROM songs',
			};
		}
		const result = await this._pool.query(query);
		return result.rows;
	}

	async getSongById(id) {
		const query = {
			text: 'SELECT * FROM songs WHERE id = $1',
			values: [id],
		};
		const result = await this._pool.query(query);
		if (!result.rows.length) {
			throw new NotFoundError('Song tidak ditemukan');
		}
		return result.rows.map(mapSongs)[0];
	}

	async editSongById(id, payloads) {
		// filter undefined column
		const keys = Object.keys(payloads).filter((k) => {
			return payloads[k] !== undefined;
		});
		// build UPDATE SET
		const field = keys.map((k, index) => {
			return k + ' = $' + (index + 1);
		}).join(', ');
		// build values
		const values = keys.map((k) => {
			return payloads[k];
		});
		// add last number of where
		const whereKey = (Object.keys(payloads).length + 1);
		// push id to last object
		values.push(id);
		const query = {
			text: 'UPDATE songs SET ' + field + ' WHERE id = $' + whereKey + ' RETURNING id',
			values: values,
		};
		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Gagal memperbarui song, ID tidak ditemukan');
		}
	}

	async deleteSongById(id) {
		const query = {
			text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
			values: [id],
		};
		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Song gagal dihapus. ID tidak ditemukan');
		}
	}
}

module.exports = SongsService;
