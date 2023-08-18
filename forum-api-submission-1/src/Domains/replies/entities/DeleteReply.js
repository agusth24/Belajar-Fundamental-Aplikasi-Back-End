class DeleteReply {
	constructor(threadId, commentId, replyId) {
		this._verifyPayload(threadId, commentId, replyId);

		this.replyId = replyId;
	}

	_verifyPayload(threadId, commentId, replyId) {
		if (!threadId || !commentId || !replyId) {
			throw new Error('REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
		}
		if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof replyId !== 'string') {
			throw new Error('REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
		}
	}
}

module.exports = DeleteReply;
