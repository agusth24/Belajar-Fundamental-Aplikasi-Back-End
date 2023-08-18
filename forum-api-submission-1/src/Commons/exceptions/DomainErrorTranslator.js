const InvariantError = require('./InvariantError');

const DomainErrorTranslator = {
	translate(error) {
		return DomainErrorTranslator._directories[error.message] || error;
	},
};

DomainErrorTranslator._directories = {
	'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
	'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
	'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
	'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
	'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
	'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
	'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
	'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
	'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
	'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
	'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan judul, isi dan owner thread'),
	'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai'),
	'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan isi comment'),
	'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat comment baru karena tipe data tidak sesuai'),
	'GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan id thread'),
	'GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detil thread karena tipe data tidak sesuai'),
	'THREADS.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan judul, isi, tanggal dan owner thread'),
	'THREADS.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detil thread karena tipe data tidak sesuai'),
	'COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan owner, tanggal dan isi comment'),
	'COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detil comment karena tipe data tidak sesuai'),
	'DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan id thread dan comment'),
	'DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menghapus comment karena tipe data tidak sesuai'),
	'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan isi reply'),
	'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat reply baru karena tipe data tidak sesuai'),
	'REPLIES.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan owner, tanggal dan isi reply'),
	'REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detil reply karena tipe data tidak sesuai'),
	'REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan id thread, comment, dan reply'),
	'REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menghapus reply karena tipe data tidak sesuai'),
};

module.exports = DomainErrorTranslator;
