/* eslint-disable camelcase */
exports.up = (pgm) => {
	pgm.createTable('songs', {
		id: {
			type: 'VARCHAR(21)',
			primaryKey: true,
		},
		title: {
			type: 'TEXT',
			notNull: true,
		},
		year: {
			type: 'NUMERIC',
			notNull: true,
		},
		genre: {
			type: 'TEXT',
			notNull: true,
		},
		performer: {
			type: 'TEXT',
			notNull: true,
		},
		duration: {
			type: 'NUMERIC',
			notNull: false,
		},
		albumId: {
			type: 'VARCHAR(22)',
			notNull: false,
		},
	});
};

exports.down = (pgm) => {
	pgm.dropTable('songs');
};
