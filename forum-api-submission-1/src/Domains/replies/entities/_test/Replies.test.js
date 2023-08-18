const Replies = require('../Replies');

describe('a Replies entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'agusth',
      content: 'sebuah balasan',
    };

    // Action and Assert
    expect(() => new Replies(payload)).toThrowError('REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      comment_id: 'comment-123',
      is_deleted: false,
      username: 'agusth',
      date: '2023-12-12',
      content: 'sebuah balasan',
    };

    // Action and Assert
    expect(() => new Replies(payload)).toThrowError('REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Replies object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      comment_id: 'comment-123',
      is_deleted: false,
      username: 'agusth',
      date: new Date(),
      content: 'sebuah balasan',
    };

    // Action
    const { id, commentId, username, date, content } = new Replies(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(commentId).toEqual(payload.comment_id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
  });

  it('should create deleted Replies object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      comment_id: 'comment-123',
      is_deleted: true,
      username: 'agusth',
      date: new Date(),
      content: 'sebuah balasan',
    };

    // Action
    const { id, commentId, username, date, content } = new Replies(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(commentId).toEqual(payload.comment_id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**balasan telah dihapus**');
  });
});
