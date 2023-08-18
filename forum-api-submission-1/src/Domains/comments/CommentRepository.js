class CommentRepository {
	async addComment(payload) {
		throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async verifyComment(commentId) {
		throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async verifyCommentOnThread(commentId) {
		throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async verifyDeleteComment(commentId) {
		throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async getComment(threadId) {
		throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async deleteComment(threadId) {
		throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}
}

module.exports = CommentRepository;
