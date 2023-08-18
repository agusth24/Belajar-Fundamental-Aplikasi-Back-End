const Threads = require('../Threads');

describe('a Threads entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah thread body',
      username: 'agusth',
    };

    // Action and Assert
    expect(() => new Threads(payload)).toThrowError('THREADS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah thread body',
      date: '2023',
      username: 'agusth',
    };

    // Action and Assert
    expect(() => new Threads(payload)).toThrowError('THREADS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Threads object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah thread body',
      date: new Date(),
      username: 'agusth',
    };

    // Action
    const { id, title, body, date, username } = new Threads(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
