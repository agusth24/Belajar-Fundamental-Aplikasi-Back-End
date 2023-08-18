const Threads = require('../../../Domains/threads/entities/Threads');
const Comments = require('../../../Domains/comments/entities/Comments');
const Replies = require('../../../Domains/replies/entities/Replies');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../threads/GetThreadUseCase');

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get comment action correctly', async () => {
    // Arrange
    const id = {
      threadId: 'thread-xyz'
    };
    const threads = new Threads({
      id: id.threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: new Date(),
      username: "dicoding",
    });
    const comments = [
      new Comments({
        id: "comment-123",
        username: "johndoe",
        date: new Date(),
        is_deleted: false,
        content: "sebuah comment",
      }),
      new Comments({
        id: "comment-xyz",
        username: "dicoding",
        date: new Date(),
        is_deleted: true,
        content: "**komentar telah dihapus**"
      }),
    ];

    const replies = [
      {
        id: 'reply-123',
        username: 'dicoding',
        date: new Date(),
        content: 'sebuah balasan',
        is_deleted: false,
        comment_id: 'comment-123'
      },
      {
        id: 'reply-xyz',
        username: 'johndoe',
        date: new Date(),
        content: 'sebuah balasan',
        is_deleted: true,
        comment_id: 'comment-123'
      }
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(threads));
    mockCommentRepository.getComment = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));
    mockReplyRepository.getReply = jest.fn()
      .mockImplementation(() => Promise.resolve(replies));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const expectedThread = {
      ...threads,
      comments: comments.map((comment) => {
        const rawReplies = replies.filter((reply) => reply.comment_id === comment.id);
        return {
          ...comment,
          replies: rawReplies.map((reply) => new Replies(reply),
          ),
        };
      }),
    };

    // Action
    const resultThread = await getThreadUseCase.execute(id.threadId);

    // Assert    
    expect(resultThread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.verifyThread).toBeCalledWith(threads.id);
    expect(mockThreadRepository.getThread).toBeCalledWith({ threadId: threads.id });
    expect(mockCommentRepository.getComment).toBeCalledWith({ threadId: threads.id });
    expect(mockReplyRepository.getReply).toBeCalledWith(comments.map((comment) => comment.id));
  });
});
