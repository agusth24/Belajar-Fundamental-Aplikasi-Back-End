class ReplyRepository {
	async addReply(payload) {
		throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async getReply(commentId) {
		throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async verifyReply(replyId) {
		throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async verifyDeleteReply(replyId) {
		throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async deleteReply(replyId) {
		throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}
}

module.exports = ReplyRepository;
