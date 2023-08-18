/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('replies', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        comment_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        content: {
            type: 'TEXT',
            notNull: true,
        },
        owner: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        is_deleted: {
            type: 'BOOLEAN',
            notNull: true,
            default: pgm.func('FALSE'),
        },
        date: {
            type: 'TIMESTAMPTZ',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
    });

    pgm.addConstraint(
        'replies',
        'fk_thread_replies.comment_id_comments.id',
        'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE',
    );

    pgm.addConstraint(
		'replies',
		'fk_users_replies.owner_users.id',
		'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
	);
};

exports.down = (pgm) => {
    pgm.dropTable('replies');
};
