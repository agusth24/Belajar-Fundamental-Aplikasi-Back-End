const DeleteReply = require('../DeleteReply');

describe('a DeleteReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const threadId = 'thread-123';

    // Action and Assert
    expect(() => new DeleteReply(threadId)).toThrowError('REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 123;
    const replyId = 'reply-123';

    // Action and Assert
    expect(() => new DeleteReply(threadId, commentId, replyId)).toThrowError('REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeleteReply object correctly', () => {
    // Arrange
    const payloadThreadId = 'thread-123';
    const payloadCommentId = 'comment-123';
    const payloadReplyId = 'comment-123';

    // Action
    const { replyId } = new DeleteReply(payloadThreadId, payloadCommentId, payloadReplyId);

    // Assert
    expect(replyId).toEqual(payloadReplyId);
  });
});
