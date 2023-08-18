const AddedComment = require('../../Domains/comments/entities/AddedComment');
const Comments = require('../../Domains/comments/entities/Comments');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
	constructor(pool, idGenerator) {
		super();
		this._pool = pool;
		this._idGenerator = idGenerator;
	}

	async addComment({ content }, threadId, owner) {
		const id = `comment-${this._idGenerator()}`;

		const query = {
			text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
			values: [id, threadId, content, owner],
		};

		const result = await this._pool.query(query);

		return new AddedComment(result.rows[0]);
	}

	async verifyComment(id) {
		const query = {
			text: 'SELECT id FROM comments WHERE id = $1',
			values: [id],
		};

		const result = await this._pool.query(query);
		if (result.rowCount === 0) throw new NotFoundError('comment tidak ditemukan');
	}

	async verifyCommentOnThread(commentId, threadId) {
		const query = {
			text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2',
			values: [commentId, threadId],
		};

		const result = await this._pool.query(query);
		if (result.rowCount === 0) throw new NotFoundError('comment tidak ditemukan');
	}

	async verifyDeleteComment(id, owner) {
		const query = {
			text: 'SELECT id FROM comments WHERE id = $1 AND owner = $2',
			values: [id, owner],
		};

		const result = await this._pool.query(query);
		if (result.rowCount === 0) throw new AuthorizationError('akses hapus comment tidak diijinkan');
	}

	async getComment({ threadId }) {
		const query = {
			text: `
			SELECT comments.id, users.username, comments.date, comments.is_deleted, comments.content
			FROM comments 
			LEFT JOIN users ON comments.owner = users.id
			WHERE comments.thread_id = $1
			ORDER BY comments.date
			`,
			values: [threadId],
		};

		const result = await this._pool.query(query);
		return result.rows.map((val) => new Comments(val));
	}

	async deleteComment({ commentId: id }) {

		const query = {
			text: `UPDATE comments SET is_deleted = true WHERE id = $1 RETURNING id`,
			values: [id],
		};

		await this._pool.query(query);
	}
}

module.exports = CommentRepositoryPostgres;
