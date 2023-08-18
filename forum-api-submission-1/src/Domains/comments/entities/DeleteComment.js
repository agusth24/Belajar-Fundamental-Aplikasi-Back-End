class DeleteComment {
	constructor(threadId, commentId) {
		this._verifyPayload(threadId, commentId);

		this.commentId = commentId;
	}

	_verifyPayload(threadId, commentId) {
		if (!threadId || !commentId) {
			throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
		}
		if (typeof threadId !== 'string' || typeof commentId !== 'string') {
			throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
		}
	}
}

module.exports = DeleteComment;
