const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const Threads = require('../../../Domains/threads/entities/Threads');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
	afterEach(async () => {
		await ThreadsTableTestHelper.cleanTable();
		await UsersTableTestHelper.cleanTable();
	});

	afterAll(async () => {
		await pool.end();
	});

	describe('addThread function', () => {
		it('should persist add thread and return added thread correctly', async () => {
			// Arrange
			const addThread = new AddThread({
				title: 'sebuah thread',
				body: 'sebuah body thread',
			});
			const owner = 'agusth';
			const fakeIdGenerator = () => '123'; // stub!
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			await threadRepositoryPostgres.addThread(addThread, owner);

			// Assert
			const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
			expect(threads).toHaveLength(1);
		});

		it('should return registered thread correctly', async () => {
			// Arrange
			const addThread = new AddThread({
				title: 'sebuah thread',
				body: 'sebuah body thread',
			});
			const owner = 'agusth';
			const fakeIdGenerator = () => '123'; // stub!
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			const addedThread = await threadRepositoryPostgres.addThread(addThread, owner);

			// Assert
			expect(addedThread).toStrictEqual(new AddedThread({
				id: 'thread-123',
				title: 'sebuah thread',
				owner: owner,
			}));
		});
	});

	describe('verifyThread function', () => {
		it('should return verify thread not found', async () => {
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(threadRepositoryPostgres.verifyThread({})).rejects.toThrowError(NotFoundError);
		});

		it('should return verify thread correctly', async () => {
			// Arrange
			const threadId = 'thread-123';
			await ThreadsTableTestHelper.addThread({
				id: threadId,
				title: 'sebuah thread',
				body: 'sebuah body thread',
			});
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(threadRepositoryPostgres.verifyThread(threadId)).resolves.not.toThrowError(NotFoundError);
		});
	});

	describe('getThread', () => {
		it('should throw InvariantError when thread not found', async () => {
			// Arrange
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

			// Action & Assert
			await expect(threadRepositoryPostgres.getThread({ threadId: 'thread-xyz' })).rejects.toThrowError(InvariantError);
		});

		it('should return thread correctly', async () => {
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
				owner: 'user-123'
			}
			// addThread two thread
			await UsersTableTestHelper.addUser(user);
			await ThreadsTableTestHelper.addThread(thread);
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

			// Action
			const threads = await threadRepositoryPostgres.getThread({ threadId: thread.id });

			// Assert
			expect(threads).toStrictEqual(new Threads({
				id: thread.id,
				title: thread.title,
				body: thread.body,
				date: thread.date,
				username: user.username,
			}));
		});
	});
});
