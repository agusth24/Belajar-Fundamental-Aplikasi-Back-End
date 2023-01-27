/* eslint-disable quotes */
exports.up = (pgm) => {
	// membuat album baru.
	pgm.sql("INSERT INTO albums(id, name, year) VALUES ('old_songs', 'old_songs', '2022')");

	// mengubah nilai album_id_songs pada song yang album_id_songs-nya bernilai NULL
	pgm.sql("UPDATE songs SET album_id = 'old_songs' WHERE songs.album_id IS NULL");

	// memberikan constraint foreign key pada song terhadap kolom id dari tabel albums
	pgm.addConstraint('songs', 'fk_songs.album_id_songs.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
	// menghapus constraint fk_songs.album_id_songs.id pada tabel songs
	pgm.dropConstraint('songs', 'fk_songs.album_id_songs.id');

	// mengubah nilai album_id_songs old_songs pada song menjadi NULL
	pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_songs'");

	// menghapus album baru.
	pgm.sql("DELETE FROM albums WHERE id = 'old_songs'");
};
