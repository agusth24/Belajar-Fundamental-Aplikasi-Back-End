const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const Comments = require('../../../Domains/comments/entities/Comments');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
	afterEach(async () => {
		await ThreadsTableTestHelper.cleanTable();
		await UsersTableTestHelper.cleanTable();
	});

	afterAll(async () => {
		await pool.end();
	});

	describe('addComment function', () => {
		it('should persist add comment and return added thread correctly', async () => {
			// Arrange
			const user = {
				id: 'user-123',
				username: 'agusth',
			}
			const thread = {
				id: 'thread-123',
				title: 'sebuah thread',
				body: 'sebuah thread',
				date: new Date(),
				owner: user.id
			}
			const addComment = new AddComment({
				content: 'sebuah comment',
			}, thread.id);
			const fakeIdGenerator = () => '123'; // stub!
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			await UsersTableTestHelper.addUser(user);
			await ThreadsTableTestHelper.addThread(thread);
			const addedComment = await commentRepositoryPostgres.addComment(addComment, thread.id, user.id);

			// Assert
			expect(addedComment).toStrictEqual(new AddedComment({
				id: 'comment-123',
				content: 'sebuah comment',
				owner: user.id,
			}));

			const comments = await ThreadsTableTestHelper.findCommentsById('comment-123');
			expect(comments).toHaveLength(1);
		});
	});

	describe('verifyComment function', () => {
		it('should return verify comment not found', async () => {
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(commentRepositoryPostgres.verifyComment({})).rejects.toThrowError(NotFoundError);
		});

		it('should return verify comment correctly', async () => {
			// Arrange
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ commentId, threadId });
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(commentRepositoryPostgres.verifyComment(commentId)).resolves.not.toThrowError(NotFoundError);
		});
	});

	describe('verifyCommentOnThread function', () => {
		it('should return verify comment on thread not found', async () => {
			const userId = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ commentId, threadId, userId });
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(commentRepositoryPostgres.verifyCommentOnThread(commentId, 'thread-xyz')).rejects.toThrowError(NotFoundError);
		});

		it('should return verify comment on thread correctly', async () => {
			const userId = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ commentId, threadId, userId });
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(commentRepositoryPostgres.verifyCommentOnThread(commentId, threadId)).resolves.not.toThrowError(NotFoundError);
		});
	});

	describe('verifyDeleteComment function', () => {
		it('should return verify comment not authorize', async () => {
			const userId = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ commentId, threadId, owner: userId });
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(commentRepositoryPostgres.verifyDeleteComment(commentId, 'user-xyz')).rejects.toThrowError(AuthorizationError);
		});

		it('should return verify comment correctly', async () => {
			const userId = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ id: commentId, threadId, userId });
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(commentRepositoryPostgres.verifyDeleteComment(commentId, userId)).resolves.not.toThrowError(AuthorizationError);
		});
	});

	describe('deleteComment function', () => {
		it('should soft delete comment from database', async () => {
			const userId = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ commentId, threadId, owner: userId });
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

			// Action
			await commentRepositoryPostgres.deleteComment({ commentId });

			// Assert
			const comment = await ThreadsTableTestHelper.findCommentsById(commentId);
			expect(comment[0].id).toStrictEqual(commentId);
			expect(comment[0].is_deleted).toStrictEqual(true);
		});
	});

	describe('getComment', () => {
		it('should not throw InvariantError when thread not found', async () => {
			// Arrange
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(commentRepositoryPostgres.getComment({ threadId: 'thread-xyz' })).resolves.not.toThrowError(InvariantError);
		});

		it('should return comment correctly', async () => {
			// Arrange
			const user = {
				id: 'user-123',
				username: 'agusth',
			}
			const thread = {
				id: 'thread-123',
				title: 'sebuah thread',
				body: 'sebuah thread',
				date: new Date(),
				owner: user.id
			}
			const comments = [
				{
					commentId: 'comment-123',
					threadId: thread.id,
					content: 'sebuah comment',
					date: new Date("2023-08-17T03:24:00"),
					owner: user.id,
					is_deleted: false
				},
				{
					commentId: 'comment-xyz',
					threadId: thread.id,
					content: 'sebuah comment',
					date: new Date("2023-08-17T03:25:12"),
					owner: user.id,
					is_deleted: true
				},
			];

			await UsersTableTestHelper.addUser(user);
			await ThreadsTableTestHelper.addThread(thread);
			await ThreadsTableTestHelper.addComment(comments[0]);
			await ThreadsTableTestHelper.addComment(comments[1]);
			const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

			// Action
			const resultComments = await commentRepositoryPostgres.getComment({ threadId: thread.id });

			// Assert
			expect(resultComments[0]).toStrictEqual(new Comments({
				id: comments[0].commentId,
				username: user.username,
				date: comments[0].date,
				is_deleted: comments[0].is_deleted,
				content: comments[0].content
			}));
			expect(resultComments[1]).toStrictEqual(new Comments({
				id: comments[1].commentId,
				username: user.username,
				date: comments[1].date,
				is_deleted: comments[1].is_deleted,
				content: comments[1].content
			}));
		});
	});
});
