const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
	constructor(pool, idGenerator) {
		super();
		this._pool = pool;
		this._idGenerator = idGenerator;
	}

	async addReply({ content, commentId }, owner) {
		const id = `reply-${this._idGenerator()}`;

		const query = {
			text: 'INSERT INTO replies VALUES($1, $2, $3, $4) RETURNING id, content, owner',
			values: [id, commentId, content, owner],
		};

		const result = await this._pool.query(query);

		return new AddedReply(result.rows[0]);
	}

	async getReply(commentId) {
		const query = {
			text: `
			SELECT replies.id, replies.comment_id, replies.is_deleted, 
			replies.content, replies.date, users.username
			FROM replies 
			LEFT JOIN users ON replies.owner = users.id
			WHERE replies.comment_id = ANY($1::TEXT[])
			ORDER BY replies.date
			`,
			values: [commentId],
		};

		const result = await this._pool.query(query);
		return result.rows;
	}

	async verifyReply(id) {
		const query = {
			text: 'SELECT id FROM replies WHERE id = $1',
			values: [id],
		};

		const result = await this._pool.query(query);
		if (result.rowCount === 0) throw new NotFoundError('reply tidak ditemukan');
	}

	async verifyDeleteReply(id, owner) {
		const query = {
			text: 'SELECT id FROM replies WHERE id = $1 AND owner = $2',
			values: [id, owner],
		};

		const result = await this._pool.query(query);
		if (result.rowCount === 0) throw new AuthorizationError('akses hapus reply tidak diijinkan');
	}

	async deleteReply({ replyId: id }) {

		const query = {
			text: `UPDATE replies SET is_deleted = true WHERE id = $1 RETURNING id`,
			values: [id],
		};

		await this._pool.query(query);
	}
}

module.exports = ReplyRepositoryPostgres;
