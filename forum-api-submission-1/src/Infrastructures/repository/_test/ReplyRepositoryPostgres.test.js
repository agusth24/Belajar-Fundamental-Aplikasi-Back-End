const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
	afterEach(async () => {
		await ThreadsTableTestHelper.cleanTable();
		await UsersTableTestHelper.cleanTable();
	});

	afterAll(async () => {
		await pool.end();
	});

	describe('addReply function', () => {
		it('should persist add reply and return added thread correctly', async () => {
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
			const comments = {
				commentId: 'comment-123',
				threadId: thread.id,
				content: 'sebuah comment',
				date: new Date(),
				owner: user.id,
				is_deleted: false
			};
			const addReply = new AddReply({
				content: 'sebuah balasan',
			}, comments.commentId);
			const fakeIdGenerator = () => '123'; // stub!
			const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			await UsersTableTestHelper.addUser(user);
			await ThreadsTableTestHelper.addThread(thread);
			await ThreadsTableTestHelper.addComment(comments);
			const addedReply = await replyRepositoryPostgres.addReply(addReply, user.id);

			// Assert
			expect(addedReply).toStrictEqual(new AddedReply({
				id: 'reply-123',
				content: 'sebuah balasan',
				owner: user.id,
			}));

			const replies = await ThreadsTableTestHelper.findRepliesById('reply-123');
			expect(replies).toHaveLength(1);
		});
	});

	describe('getReply', () => {
		it('should not throw InvariantError when comment not found', async () => {
			// Arrange
			const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(replyRepositoryPostgres.getReply(['comment-xyz'])).resolves.not.toThrowError(InvariantError);
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
					date: new Date(),
					owner: user.id,
					is_deleted: false
				},
				{
					commentId: 'comment-xyz',
					threadId: thread.id,
					content: 'sebuah comment',
					date: new Date(),
					owner: user.id,
					is_deleted: true
				},
			];
			const replies = [
				{
					replyId: 'reply-123',
					commentId: comments[0].commentId,
					content: 'sebuah balasan',
					date: new Date("2023-08-17T03:24:00"),
					owner: user.id,
					is_deleted: false
				},
				{
					replyId: 'reply-xyz',
					commentId: comments[0].commentId,
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
			await ThreadsTableTestHelper.addReply(replies[0]);
			await ThreadsTableTestHelper.addReply(replies[1]);
			const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

			// Action
			const resultReplies = await replyRepositoryPostgres.getReply([comments[0].commentId]);

			// Assert
			expect(resultReplies[0]).toStrictEqual({
				id: replies[0].replyId,
				comment_id: replies[0].commentId,
				is_deleted: replies[0].is_deleted,
				content: replies[0].content,
				date: replies[0].date,
				username: user.username,
			});
			expect(resultReplies[1]).toStrictEqual({
				id: replies[1].replyId,
				comment_id: replies[1].commentId,
				is_deleted: replies[1].is_deleted,
				content: replies[1].content,
				date: replies[1].date,
				username: user.username,
			});
		});
	});

	describe('verifyReply function', () => {
		it('should return verify reply not found', async () => {
			const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(replyRepositoryPostgres.verifyReply({})).rejects.toThrowError(NotFoundError);
		});

		it('should return verify reply correctly', async () => {
			// Arrange
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			const replyId = 'reply-123';
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ commentId, threadId });
			await ThreadsTableTestHelper.addReply({ replyId });
			const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(replyRepositoryPostgres.verifyReply(replyId)).resolves.not.toThrowError(NotFoundError);
		});
	});

	describe('verifyDeleteReply function', () => {
		it('should return verify reply not authorize', async () => {
			const userId = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			const replyId = 'reply-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ commentId, threadId, owner: userId });
			await ThreadsTableTestHelper.addReply({ replyId, owner: userId });
			const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(replyRepositoryPostgres.verifyDeleteReply(replyId, 'user-xyz')).rejects.toThrowError(AuthorizationError);
		});

		it('should return verify reply correctly', async () => {
			const userId = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			const replyId = 'reply-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ commentId, threadId, owner: userId });
			await ThreadsTableTestHelper.addReply({ replyId, owner: userId });
			const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(replyRepositoryPostgres.verifyDeleteReply(replyId, userId)).resolves.not.toThrowError(AuthorizationError);
		});
	});

	describe('deleteReply function', () => {
		it('should soft delete reply from database', async () => {
			const userId = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			const replyId = 'reply-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ commentId, threadId, owner: userId });
			await ThreadsTableTestHelper.addReply({ replyId, owner: userId });
			const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

			// Action
			await replyRepositoryPostgres.deleteReply({ replyId });

			// Assert
			const reply = await ThreadsTableTestHelper.findRepliesById(replyId);
			expect(reply[0].id).toStrictEqual(replyId);
			expect(reply[0].is_deleted).toStrictEqual(true);
		});
	});
});
