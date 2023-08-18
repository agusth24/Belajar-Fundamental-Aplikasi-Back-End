class GetComment {
	constructor(threadId) {
		this._verifyPayload(threadId);

		this.threadId = threadId;
	}

	_verifyPayload(threadId) {
		if (!threadId) {
			throw new Error('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
		}
		if (typeof threadId !== 'string') {
			throw new Error('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
		}
	}
}

module.exports = GetComment;
