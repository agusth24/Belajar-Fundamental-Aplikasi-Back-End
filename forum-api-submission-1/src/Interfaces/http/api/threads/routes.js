const Constants = require('../../../../Commons/constants');

const routes = (handler) => ([
	{
		method: 'POST',
		path: '/threads',
		handler: handler.postThreadHandler,
		options: {
			auth: Constants.idAuthStrategy,
		},
	},
	{
		method: 'GET',
		path: '/threads/{id}',
		handler: handler.getThreadHandler,
	},
	{
		method: 'POST',
		path: '/threads/{id}/comments',
		handler: handler.postCommentHandler,
		options: {
			auth: Constants.idAuthStrategy,
		},
	},
	{
		method: 'DELETE',
		path: '/threads/{threadId}/comments/{commentId}',
		handler: handler.deleteCommentHandler,
		options: {
			auth: Constants.idAuthStrategy,
		},
	},
	{
		method: 'POST',
		path: '/threads/{threadId}/comments/{commentId}/replies',
		handler: handler.postReplyHandler,
		options: {
			auth: Constants.idAuthStrategy,
		},
	},
	{
		method: 'DELETE',
		path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
		handler: handler.deleteReplyHandler,
		options: {
			auth: Constants.idAuthStrategy,
		},
	},
]);

module.exports = routes;
