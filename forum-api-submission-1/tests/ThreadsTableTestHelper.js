/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');
const AddedThread = require('../src/Domains/threads/entities/AddedThread');
const AddedComment = require('../src/Domains/comments/entities/AddedComment');
const AddedReply = require('../src/Domains/replies/entities/AddedReply');

const ThreadsTableTestHelper = {
	async addThread({
		id = 'thread-123', title = 'sebuah thread', body = 'sebuah body thread', owner = 'user-123', date = new Date(),
	}) {
		const query = {
			text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6) RETURNING id, title, owner',
			values: [id, title, body, owner, false, date],
		};

		const result = await pool.query(query);

		return new AddedThread({ ...result.rows[0] });
	},

	async addComment({
		commentId = 'comment-123', threadId = 'thread-123', content = 'Sebuah Comment', owner = 'user-123', date = new Date(), is_deleted = false
	}) {
		const query = {
			text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
			values: [commentId, threadId, content, owner, is_deleted, date],
		};

		const result = await pool.query(query);

		return new AddedComment({ ...result.rows[0] });
	},

	async deleteComment({ commentId: id }) {

		const query = {
			text: `UPDATE comments SET is_deleted = true WHERE id = $1 RETURNING id`,
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows[0].id;
	},

	async addReply({
		replyId = 'reply-xyz', commentId = 'comment-123', content = 'sebuah balasan', owner = 'user-123', is_deleted = false, date = new Date() }) {
		const query = {
			text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
			values: [replyId, commentId, content, owner, is_deleted, date],
		};

		const result = await pool.query(query);

		return new AddedReply({ ...result.rows[0] });
	},

	async deleteReply({ replyId: id }) {

		const query = {
			text: `UPDATE replies SET is_deleted = true WHERE id = $1 RETURNING id`,
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows[0].id;
	},

	async findThreadsById(id) {
		const query = {
			text: 'SELECT id FROM threads WHERE id = $1',
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows;
	},

	async findCommentsById(id) {
		const query = {
			text: 'SELECT id, is_deleted FROM comments WHERE id = $1',
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows;
	},

	async findRepliesById(id) {
		const query = {
			text: 'SELECT id, is_deleted FROM replies WHERE id = $1',
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows;
	},

	async cleanTable() {
		await pool.query('DELETE FROM threads WHERE 1=1');
		await pool.query('DELETE FROM comments WHERE 1=1');
		await pool.query('DELETE FROM replies WHERE 1=1');
	},
};

module.exports = ThreadsTableTestHelper;
