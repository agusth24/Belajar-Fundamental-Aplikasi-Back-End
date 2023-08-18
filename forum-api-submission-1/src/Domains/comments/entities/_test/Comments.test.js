const Comments = require('../Comments');

describe('a Comments entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'agusth',
      content: 'sebuah comment',
    };

    // Action and Assert
    expect(() => new Comments(payload)).toThrowError('COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'agusth',
      date: '2023-12-12',
      content: 'sebuah comment',
    };

    // Action and Assert
    expect(() => new Comments(payload)).toThrowError('COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Comments object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'agusth',
      date: new Date(),
      is_deleted: false,
      content: 'sebuah comment',
    };

    // Action
    const { id, username, date, content } = new Comments(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
  });

  it('should create deleted Comments object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'agusth',
      date: new Date(),
      is_deleted: true,
      content: 'sebuah comment',
    };

    // Action
    const { id, username, date, content } = new Comments(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**komentar telah dihapus**');
  });
});
