const DeleteComment = require('../DeleteComment');

describe('a DeleteComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const threadId = 'thread-123';

    // Action and Assert
    expect(() => new DeleteComment(threadId)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 123;

    // Action and Assert
    expect(() => new DeleteComment(threadId, commentId)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeleteComment object correctly', () => {
    // Arrange
    const payloadThreadId = 'thread-123';
    const payloadCommentId = 'comment-123';

    // Action
    const { commentId } = new DeleteComment(payloadThreadId, payloadCommentId);

    // Assert
    expect(commentId).toEqual(payloadCommentId);
  });
});
