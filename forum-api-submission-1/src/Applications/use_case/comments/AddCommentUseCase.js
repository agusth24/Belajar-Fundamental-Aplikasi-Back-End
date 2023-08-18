const AddComment = require('../../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
	constructor({ threadRepository, commentRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
	}

	async execute(useCasePayload, threadId, credentialId) {
		const addComment = new AddComment(useCasePayload, threadId);
		await this._threadRepository.verifyThread(threadId);
		return this._commentRepository.addComment(addComment, threadId, credentialId);
	}
}

module.exports = AddCommentUseCase;
