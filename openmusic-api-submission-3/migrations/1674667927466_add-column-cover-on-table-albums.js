/* eslint-disable camelcase */
exports.up = (pgm) => {
	pgm.addColumn('albums', {
		cover: {
			type: 'VARCHAR(150)',
			notNull: false,
		},
	});
};

exports.down = (pgm) => {
	pgm.dropColumns('albums', {
		cover: {
			ifExists: true,
		},
	});
};
