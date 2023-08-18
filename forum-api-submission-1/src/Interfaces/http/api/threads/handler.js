const autoBind = require('auto-bind');
const AddThreadUseCase = require('../../../../Applications/use_case/threads/AddThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/threads/GetThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/comments/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/comments/DeleteCommentUseCase');
const AddReplyUseCase = require('../../../../Applications/use_case/replies/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/replies/DeleteReplyUseCase');

class ThreadsHandler {
	constructor(container) {
		this._container = container;

		autoBind(this);
	}

	async postThreadHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
		const addedThread = await addThreadUseCase.execute(request.payload, credentialId);

		const response = h.response({
			status: 'success',
			data: {
				addedThread,
			},
		});
		response.code(201);
		return response;
	}

	async postCommentHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { id: threadId } = request.params;
		const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
		const addedComment = await addCommentUseCase.execute(request.payload, threadId, credentialId);

		const response = h.response({
			status: 'success',
			data: {
				addedComment,
			},
		});
		response.code(201);
		return response;
	}

	async getThreadHandler(request, h) {
		const { id: threadId } = request.params;
		const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
		const thread = await getThreadUseCase.execute(threadId);

		const response = h.response({
			status: 'success',
			data: {
				thread,
			},
		});
		response.code(200);
		return response;
	}

	async deleteCommentHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { threadId, commentId } = request.params;
		const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
		await deleteCommentUseCase.execute(threadId, commentId, credentialId);

		const response = h.response({
			status: 'success',
		});
		response.code(200);
		return response;
	}

	async postReplyHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { threadId, commentId } = request.params;
		const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
		const addedReply = await addReplyUseCase.execute(request.payload, threadId, commentId, credentialId);

		const response = h.response({
			status: 'success',
			data: {
				addedReply,
			},
		});
		response.code(201);
		return response;
	}

	async deleteReplyHandler(request, h) {
		const { id: credentialId } = request.auth.credentials;
		const { threadId, commentId, replyId } = request.params;
		const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
		await deleteReplyUseCase.execute(threadId, commentId, replyId, credentialId);

		const response = h.response({
			status: 'success',
		});
		response.code(200);
		return response;
	}
}

module.exports = ThreadsHandler;
