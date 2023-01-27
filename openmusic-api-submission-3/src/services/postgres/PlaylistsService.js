const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
	constructor(collaborationService, songService, cacheService) {
		this._pool = new Pool();
		this._collaborationService = collaborationService;
		this._songService = songService;
		this._cacheService = cacheService;
	}

	async addPlaylist(name, owner) {
		const id = `playlist-${nanoid(16)}`;

		const query = {
			text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
			values: [id, name, owner],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new InvariantError('Playlist gagal ditambahkan');
		}

		return result.rows[0].id;
	}

	async getPlaylists(owner) {
		const query = {
			text: `SELECT playlists.id,playlists.name,users.username FROM playlists
			LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
			LEFT JOIN users ON playlists.owner = users.id
			WHERE playlists.owner = $1 OR collaborations.user_id = $1
			GROUP BY playlists.id,users.username`,
			values: [owner],
		};
		const result = await this._pool.query(query);
		return result.rows;
	}

	async getPlaylistById(id) {
		const query = {
			text: `SELECT playlists.id,playlists.name,users.username FROM playlists
			LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
			LEFT JOIN users ON playlists.owner = users.id
			WHERE playlists.id = $1`,
			values: [id],
		};
		const result = await this._pool.query(query);
		if (!result.rows.length) {
			throw new NotFoundError('Playlist tidak ditemukan');
		}
		return result.rows[0];
	}

	async editPlaylistById(id, {name}) {
		const query = {
			text: 'UPDATE playlists SET name = $1 WHERE id = $2 RETURNING id',
			values: [name, id],
		};
		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Gagal memperbarui playlist, ID tidak ditemukan');
		}
	}

	async deletePlaylistById(id) {
		const query = {
			text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
			values: [id],
		};
		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Playlist gagal dihapus. ID tidak ditemukan');
		}
	}

	async verifyPlaylistOwner(id, owner) {
		const query = {
			text: 'SELECT * FROM playlists WHERE id = $1',
			values: [id],
		};
		const result = await this._pool.query(query);
		if (!result.rows.length) {
			throw new NotFoundError('Playlist tidak ditemukan');
		}
		const note = result.rows[0];
		if (note.owner !== owner) {
			throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
		}
	}

	async verifyPlaylistAccess(playlistId, userId) {
		try {
			await this.verifyPlaylistOwner(playlistId, userId);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			try {
				await this._collaborationService.verifyCollaborator(playlistId, userId);
			} catch {
				throw error;
			}
		}
	}

	async verifySongPlaylist(songId) {
		try {
			await this._songService.getSongById(songId);
		} catch (error) {
			throw error;
		}
	}

	async addPlaylistSongActivities(playlistId, songId, userId, action) {
		const id = `activ-${nanoid(16)}`;
		const timestamp = new Date().toISOString();
		const query = {
			text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
			values: [id, playlistId, songId, userId, action, timestamp],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new InvariantError('Activities Song Playlist gagal ditambahkan');
		}
	}

	async addPlaylistSong(playlistId, songId, userId) {
		const id = `songlist-${nanoid(16)}`;

		const query = {
			text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
			values: [id, playlistId, songId],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
			throw new InvariantError('Song Playlist gagal ditambahkan');
		} else {
			this.addPlaylistSongActivities(playlistId, songId, userId, 'add');
		}

		await this._cacheService.delete(`playlist:${playlistId}`);
		return result.rows[0].id;
	}

	async getPlaylistSong(id) {
		try {
			const result = await this._cacheService.get(`playlist:${id}`);
			const response = {playlist: JSON.parse(result), state: 'cache'};
			return response;
		} catch (error) {
			try {
				const result = await this.getPlaylistById(id);
				const querySong = {
					text: `SELECT songs.id, songs.title, songs.performer FROM playlists_songs 
					LEFT JOIN songs ON playlists_songs.song_id = songs.id
					WHERE playlist_id = $1`,
					values: [id],
				};
				const resultSong = await this._pool.query(querySong);
				result.songs = (!resultSong.rows.length) ? [] : resultSong.rows;
				await this._cacheService.set(`playlist:${id}`, JSON.stringify(result));
				const response = {playlist: result, state: 'database'};
				return response;
			} catch (error) {
				throw error;
			}
		}
	}

	async deletePlaylistSongById(playlistId, songId, userId) {
		const query = {
			text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
			values: [playlistId, songId],
		};
		const result = await this._pool.query(query);

		if (!result.rows.length) {
			throw new NotFoundError('Song Playlist gagal dihapus. ID tidak ditemukan');
		} else {
			this.addPlaylistSongActivities(playlistId, songId, userId, 'delete');
		}
		await this._cacheService.delete(`playlist:${playlistId}`);
	}

	async getPlaylistSongActivities(playlistId) {
		const query = {
			text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time 
			FROM playlist_song_activities
			LEFT JOIN users ON playlist_song_activities.user_id = users.id
			LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
			WHERE playlist_id = $1`,
			values: [playlistId],
		};
		const result = await this._pool.query(query);
		return result.rows;
	}
}

module.exports = PlaylistsService;
