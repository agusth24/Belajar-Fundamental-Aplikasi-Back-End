class AddReply {
	constructor(payload, commentId) {
		this._verifyPayload(payload, commentId);

		const { content } = payload;
		this.content = content;
		this.commentId = commentId;
	}

	_verifyPayload({ content }, commentId) {
		if (!content || !commentId) {
			throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
		}
		if (typeof content !== 'string' || typeof commentId !== 'string') {
			throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
		}
	}
}

module.exports = AddReply;
