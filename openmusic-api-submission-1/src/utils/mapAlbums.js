const mapAlbums = ({
	id,
	name,
	year,
}) => ({
	id,
	name,
	year: parseInt(year),
});

module.exports = {mapAlbums};
