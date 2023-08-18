const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../threads/AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    const owner = 'user-123';

    const addedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(addedThread));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository
    });

    // Action
    const resultThread = await addThreadUseCase.execute(useCasePayload, owner);

    // Assert
    expect(resultThread).toStrictEqual(addedThread);

    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread(useCasePayload), owner
    );
  });
});
