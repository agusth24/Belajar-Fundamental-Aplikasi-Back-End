const mapSongs = ({
	id,
	title,
	year,
	genre,
	performer,
	duration,
	albumId,
}) => ({
	id,
	title,
	year: parseInt(year),
	genre,
	performer,
	duration: parseInt(duration),
	albumId,
});

module.exports = {mapSongs};
