/* eslint-disable camelcase */
exports.up = (pgm) => {
	pgm.createTable('playlists', {
		id: {
			type: 'VARCHAR(50)',
			primaryKey: true,
		},
		name: {
			type: 'TEXT',
			notNull: true,
		},
		owner: {
			type: 'VARCHAR(22)',
			notNull: true,
		},
	});

	pgm.addConstraint('playlists', 'fk_playlists.owner_playlists.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
	pgm.dropTable('playlists');
};
