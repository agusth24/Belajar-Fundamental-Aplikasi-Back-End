class Comments {
	constructor(payload) {
		this._verifyPayload(payload);

		const { id, username, date, is_deleted, content } = payload;

		this.id = id;
		this.username = username;
		this.date = date;
		this.content = is_deleted ? '**komentar telah dihapus**' : content;
	}

	_verifyPayload({ id, username, date, is_deleted, content }) {
		if (!id || !username || !date || !content) {
			throw new Error('COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
		}

		if (typeof id !== 'string' || typeof username !== 'string' || !(date instanceof Date) || typeof content !== 'string' || typeof is_deleted !== 'boolean') {
			throw new Error('COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
		}
	}
}

module.exports = Comments;
