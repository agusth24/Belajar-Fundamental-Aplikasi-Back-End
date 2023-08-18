const DeleteReply = require('../../../Domains/replies/entities/DeleteReply');

class DeleteReplyUseCase {
	constructor({ threadRepository, commentRepository, replyRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
		this._replyRepository = replyRepository;
	}

	async execute(threadId, commentId, replyId, credentialId) {
		const deleteReply = new DeleteReply(threadId, commentId, replyId);
		await this._threadRepository.verifyThread(threadId);
		await this._commentRepository.verifyComment(commentId);
		await this._commentRepository.verifyCommentOnThread(commentId, threadId);
		await this._replyRepository.verifyReply(replyId);
		await this._replyRepository.verifyDeleteReply(replyId, credentialId);
		return this._replyRepository.deleteReply(deleteReply);
	}
}

module.exports = DeleteReplyUseCase;
