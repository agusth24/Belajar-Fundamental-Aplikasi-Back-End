const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};
    const commentId = 'comment-123';

    // Action and Assert
    expect(() => new AddReply(payload, commentId)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };
    const commentId = 'comment-123';

    // Action and Assert
    expect(() => new AddReply(payload, commentId)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply object correctly', () => {
    // Arrange
    const commentId = 'comment-123';
    const payload = {
      content: 'sebuah comment',
    };

    // Action
    const { content, commentId: replyCommentId } = new AddReply(payload, commentId);

    // Assert
    expect(content).toEqual(payload.content);
    expect(replyCommentId).toEqual(commentId);
  });
});
