const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../comments/AddCommentUseCase');

describe('AddCommentUseCase', () => {
	/**
	 * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
	 */
	it('should orchestrating the add comment action correctly', async () => {
		// Arrange
		const useCasePayload = {
			content: 'sebuah comment',
		};

		const owner = 'user-123';
		const threadId = 'thread-123';

		const addedComment = new AddedComment({
			id: 'comment-123',
			content: useCasePayload.content,
			owner,
		});

		/** creating dependency of use case */
		const mockThreadRepository = new ThreadRepository();
		const mockCommentRepository = new CommentRepository();

		/** mocking needed function */
		mockThreadRepository.verifyThread = jest.fn()
			.mockImplementation(() => Promise.resolve());
		mockCommentRepository.addComment = jest.fn()
			.mockImplementation(() => Promise.resolve(addedComment));

		/** creating use case instance */
		const addCommentUseCase = new AddCommentUseCase({
			threadRepository: mockThreadRepository,
			commentRepository: mockCommentRepository,
		});

		// Action
		const resultComment = await addCommentUseCase.execute(useCasePayload, threadId, owner);

		// Assert
		expect(resultComment).toStrictEqual(addedComment);

		expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
		expect(mockCommentRepository.addComment).toBeCalledWith(
			new AddComment(useCasePayload, threadId), threadId, owner
		);
	});
});
