const mapAlbums = ({
	id,
	name,
	year,
	cover,
}) => ({
	id,
	name,
	year: parseInt(year),
	coverUrl: cover,
});

module.exports = {mapAlbums};
