class Replies {
	constructor(payload) {
		this._verifyPayload(payload);

		const { id, comment_id, is_deleted, content, date, username } = payload;

		this.id = id;
		this.commentId = comment_id;
		this.content = is_deleted ? '**balasan telah dihapus**' : content;
		this.date = date;
		this.username = username;
	}

	_verifyPayload({ id, comment_id, is_deleted, content, date, username }) {
		if (!id || !username || !date || !content || !comment_id) {
			throw new Error('REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
		}

		if (typeof id !== 'string' || typeof username !== 'string' || !(date instanceof Date)
			|| typeof content !== 'string' || typeof comment_id !== 'string' || typeof is_deleted !== 'boolean') {
			throw new Error('REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
		}
	}
}

module.exports = Replies;
