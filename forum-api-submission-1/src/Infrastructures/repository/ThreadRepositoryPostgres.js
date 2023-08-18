const AddedThread = require('../../Domains/threads/entities/AddedThread');
const Threads = require('../../Domains/threads/entities/Threads');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class ThreadRepositoryPostgres extends ThreadRepository {
	constructor(pool, idGenerator) {
		super();
		this._pool = pool;
		this._idGenerator = idGenerator;
	}

	async addThread({ title, body }, owner) {
		const id = `thread-${this._idGenerator()}`;

		const query = {
			text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
			values: [id, title, body, owner],
		};

		const result = await this._pool.query(query);

		return new AddedThread(result.rows[0]);
	}

	async verifyThread(id) {
		const query = {
			text: 'SELECT id FROM threads WHERE id = $1',
			values: [id],
		};

		const result = await this._pool.query(query);
		if (result.rowCount === 0) throw new NotFoundError('thread tidak ditemukan');
	}

	async getThread({ threadId }) {
		const query = {
			text: `
			SELECT threads.id, threads.title, threads.body, threads.date, users.username
			FROM threads 
			LEFT JOIN users ON threads.owner = users.id
			WHERE threads.id = $1`,
			values: [threadId],
		};

		const result = await this._pool.query(query);
		if (result.rowCount === 0) {
			throw new InvariantError('thread tidak ditemukan');
		}
		return new Threads({ ...result.rows[0] });
	}
}

module.exports = ThreadRepositoryPostgres;
