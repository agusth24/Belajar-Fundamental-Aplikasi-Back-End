const GetThread = require('../../../Domains/threads/entities/GetThread');
const Replies = require('../../../Domains/replies/entities/Replies');

class GetThreadUseCase {
	constructor({ threadRepository, commentRepository, replyRepository }) {
		this._threadRepository = threadRepository;
		this._commentRepository = commentRepository;
		this._replyRepository = replyRepository;
	}

	async execute(threadId) {
		const getThread = new GetThread(threadId);
		await this._threadRepository.verifyThread(threadId);
		const threads = await this._threadRepository.getThread(getThread);
		const rawComments = await this._commentRepository.getComment(getThread);

		const commentIds = await rawComments.map((comment) => comment.id);
		const repliesComments = await this._replyRepository.getReply(commentIds)

		const comments = rawComments.map((comment) => {
			const rawReplies = repliesComments.filter((reply) => reply.comment_id === comment.id)
			const replies = rawReplies.map((reply) => new Replies(reply));

			return { ...comment, replies }
		})

		return { ...threads, comments };
	}
}

module.exports = GetThreadUseCase;
