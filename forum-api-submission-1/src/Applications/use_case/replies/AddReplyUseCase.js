const AddReply = require('../../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
	constructor({ threadRepository, commentRepository, replyRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
		this._replyRepository = replyRepository;
	}

	async execute(useCasePayload, threadId, commentId, credentialId) {
		const addReply = new AddReply(useCasePayload, commentId);
		await this._threadRepository.verifyThread(threadId);
		await this._commentRepository.verifyComment(commentId);
		await this._commentRepository.verifyCommentOnThread(commentId, threadId);
		return this._replyRepository.addReply(addReply, credentialId);
	}
}

module.exports = AddReplyUseCase;
