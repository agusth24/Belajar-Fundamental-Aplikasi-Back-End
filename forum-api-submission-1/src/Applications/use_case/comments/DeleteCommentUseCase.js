const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
	constructor({ threadRepository, commentRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
	}

	async execute(threadId, commentId, credentialId) {
		const deleteComment = new DeleteComment(threadId, commentId);
		await this._threadRepository.verifyThread(threadId);
		await this._commentRepository.verifyComment(commentId);
		await this._commentRepository.verifyDeleteComment(commentId, credentialId);
		return this._commentRepository.deleteComment(deleteComment);
	}
}

module.exports = DeleteCommentUseCase;
