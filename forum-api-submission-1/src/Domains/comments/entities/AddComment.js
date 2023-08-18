class AddComment {
	constructor(payload, threadId) {
		this._verifyPayload(payload, threadId);

		const { content } = payload;
		this.content = content;
	}

	_verifyPayload({ content }, threadId) {
		if (!content || !threadId) {
			throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
		}
		if (typeof content !== 'string' || typeof threadId !== 'string') {
			throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
		}
	}
}

module.exports = AddComment;
