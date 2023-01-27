/* eslint-disable camelcase */
const mapSongs = ({
	id,
	title,
	year,
	genre,
	performer,
	duration,
	album_id,
}) => ({
	id,
	title,
	year: parseInt(year),
	genre,
	performer,
	duration: parseInt(duration),
	albumId: album_id,
});

module.exports = {mapSongs};
