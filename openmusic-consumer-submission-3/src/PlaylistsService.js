const {Pool} = require('pg');

class PlaylistsService {
	constructor() {
		this._pool = new Pool();
	}

	async getPlaylists(id) {
		const queryPlaylist = {
			text: `SELECT playlists.id,playlists.name FROM playlists
			WHERE playlists.id = $1`,
			values: [id],
		};
		const resultPlaylist = await this._pool.query(queryPlaylist);
		if (!resultPlaylist.rows.length) {
			console.log('Consumer: Playlist tidak ditemukan');
		} else {
			const result = resultPlaylist.rows[0];

			const querySong = {
				text: `SELECT songs.id, songs.title, songs.performer FROM playlists_songs 
				LEFT JOIN songs ON playlists_songs.song_id = songs.id
				WHERE playlist_id = $1`,
				values: [id],
			};
			const resultSong = await this._pool.query(querySong);
			result.songs = (!resultSong.rows.length) ? [] : resultSong.rows;
			return result;
		}
	}
}

module.exports = PlaylistsService;
