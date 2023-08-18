const pool = require('../../database/postgres/pool');

const LoginTestHelper = require('../../../../tests/LoginTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable()
    await pool.end()
  })

  const dummyUserFirst = {
    id: 'user-123',
    username: 'dicoding'
  }
  const dummyUserSecond = {
    id: 'user-xyz',
    username: 'agusth'
  }

  describe('when POST /threads', () => {
    it('should respond 201 status code and added thread', async () => {
      // Arrange
      const reqPayload = {
        title: 'Sebuah Thread',
        body: 'Body Thread'
      }
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedThread).toBeDefined()
      expect(responseJson.data.addedThread.id).toBeDefined()
      expect(responseJson.data.addedThread.title).toBeDefined()
      expect(responseJson.data.addedThread.owner).toBeDefined()
    })

    it('should respond 400 status code when request a bad payload', async () => {
      // Arrange
      const reqPayload = {
        title: 'Sebuah Thread',
        body: 123
      }
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai')
    })

    it('should respond 401 status code when the request does not have an authentication', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST', url: '/threads'
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })
  })

  describe('when GET /threads/{threadId}', () => {
    it('should respond 404 status code when the thread is not found', async () => {
      // Arrange
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread'
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should respond 200 with valid thread structures (contain valid comments and replies)', async () => {
      // Arrange
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      await UsersTableTestHelper.addUser(dummyUserSecond)

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: dummyUserFirst.id })

      await ThreadsTableTestHelper.addComment({
        commentId: 'comment-123',
        threadId: 'thread-123',
        content: `komentar dari ${dummyUserFirst.username}`,
        owner: dummyUserFirst.id
      })

      await ThreadsTableTestHelper.addComment({
        commentId: 'comment-xyz',
        threadId: 'thread-123',
        content: `komentar dari ${dummyUserSecond.username}`,
        owner: dummyUserSecond.id
      })

      await ThreadsTableTestHelper.deleteComment({ commentId: 'comment-xyz' })

      await ThreadsTableTestHelper.addReply({
        replyId: 'reply-123',
        commentId: 'comment-123',
        content: `balasan dari ${dummyUserFirst.username}`,
        owner: dummyUserFirst.id
      })
      await ThreadsTableTestHelper.addReply({
        replyId: 'reply-xyz',
        commentId: 'comment-123',
        content: `balasan dari ${dummyUserSecond.username}`,
        owner: dummyUserSecond.id
      })

      await ThreadsTableTestHelper.deleteReply({ replyId: 'reply-xyz' })

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123'
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toStrictEqual(200)
      expect(responseJson.status).toStrictEqual('success')

      const thread = responseJson.data.thread

      expect(thread.id).toStrictEqual('thread-123')
      expect(thread.title).toStrictEqual('sebuah thread')
      expect(thread.body).toStrictEqual('sebuah body thread')
      expect(new Date(thread.date).getDate()).toStrictEqual(new Date().getDate())
      expect(thread.username).toStrictEqual(dummyUserFirst.username)

      const [dummyUserComment, dummyUser2Comment] = thread.comments

      expect(dummyUserComment.id).toStrictEqual('comment-123')
      expect(dummyUserComment.username).toStrictEqual(dummyUserFirst.username)
      expect(new Date(dummyUserComment.date).getDate()).toStrictEqual(new Date().getDate())
      expect(dummyUserComment.content).toStrictEqual(`komentar dari ${dummyUserFirst.username}`)

      expect(dummyUser2Comment.id).toStrictEqual('comment-xyz')
      expect(dummyUser2Comment.username).toStrictEqual(dummyUserSecond.username)
      expect(new Date(dummyUser2Comment.date).getDate()).toStrictEqual(new Date().getDate())
      expect(dummyUser2Comment.content).toStrictEqual('**komentar telah dihapus**')

      const [dummyUserReply, dummyUser2Reply] = dummyUserComment.replies

      expect(dummyUserReply.id).toStrictEqual('reply-123')
      expect(dummyUserReply.username).toStrictEqual(dummyUserFirst.username)
      expect(new Date(dummyUserReply.date).getDate()).toStrictEqual(new Date().getDate())
      expect(dummyUserReply.content).toStrictEqual(`balasan dari ${dummyUserFirst.username}`)

      expect(dummyUser2Reply.id).toStrictEqual('reply-xyz')
      expect(dummyUser2Reply.username).toStrictEqual(dummyUserSecond.username)
      expect(new Date(dummyUser2Reply.date).getDate()).toStrictEqual(new Date().getDate())
      expect(dummyUser2Reply.content).toStrictEqual('**balasan telah dihapus**')
    })
  })

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond 401 status code when the request does not have an authentication', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST', url: '/threads/thread-123/comments'
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should respond 400 status code when request a bad payload', async () => {
      // Arrange
      const reqPayload = { content: 400 }
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai')
    })

    it('should respond 404 status code when the thread is not found', async () => {
      // Arrange
      const reqPayload = { content: 'A comment' }
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-/comments',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should respond 201 status code and added comment ', async () => {
      // Arrange
      const reqPayload = { content: 'A comment' }
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      await ThreadsTableTestHelper.addThread({ id: 'thread-xyz', owner: dummyUserFirst.id })

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xyz/comments',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedComment).toBeDefined()
      expect(responseJson.data.addedComment.id).toBeDefined()
      expect(responseJson.data.addedComment.content).toBeDefined()
      expect(responseJson.data.addedComment.owner).toBeDefined()
    })
  })

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond 401 status code when the request does not have an authentication', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE', url: '/threads/thread-123/comments/comment-123'
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should respond 404 status code when the thread is not found', async () => {
      // Arrange
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should respond 404 status code when the comment is not found', async () => {
      // Arrange
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-xyz/comments/comment',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('comment tidak ditemukan')
    })

    it('should respond 403 status code when user is not the comment owner ', async () => {
      // Arrange
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      await UsersTableTestHelper.addUser(dummyUserSecond)

      const accessToken = await LoginTestHelper.login(dummyUserSecond)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(403)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('akses hapus comment tidak diijinkan')
    })

    it('should respond 200 status code ', async () => {
      // Arrange
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })
  })

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    const validTestUrl = '/threads/thread-123/comments/comment-123/replies'

    it('should respond 401 status code when the request does not have an authentication', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST', url: validTestUrl
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should respond 400 status code when request a bad payload', async () => {
      // Arrange
      const reqPayload = { content: 400 }
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: validTestUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai')
    })

    it('should respond 404 status code when the thread is not found', async () => {
      // Arrange
      const reqPayload = { content: 'A Reply' }
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread/comments/comment-123/replies',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should respond 404 status code when the comment is not found', async () => {
      // Arrange
      const reqPayload = { content: 'A Reply' }
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment/replies',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('comment tidak ditemukan')
    })

    it('should respond 404 status code when the comment is not found ON THE THREAD', async () => {
      // Arrange
      const reqPayload = { content: 'A Reply' }
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xyz/comments/comment-123/replies',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('comment tidak ditemukan')
    })

    it('should respond 201 status code and added reply', async () => {
      // Arrange
      const reqPayload = { content: 'A Reply' }
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: validTestUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        payload: reqPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedReply).toBeDefined()
      expect(responseJson.data.addedReply.id).toBeDefined()
      expect(responseJson.data.addedReply.content).toBeDefined()
      expect(responseJson.data.addedReply.owner).toBeDefined()
    })
  })

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    const validTestUrl = '/threads/thread-123/comments/comment-123/replies/reply-123'

    it('should respond 401 status code when the request does not have an authentication', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE', url: validTestUrl
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(401)
      expect(responseJson.error).toBeDefined()
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should respond 404 status code when the thread is not found', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should respond 404 status code when the comment is not found', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('comment tidak ditemukan')
    })

    it('should respond 404 status code when the reply is not found', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('reply tidak ditemukan')
    })

    it('should respond 404 status code when the comment is not found ON THE THREAD', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-xyz/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('comment tidak ditemukan')
    })

    it('should respond 403 status code when user is not the reply owner ', async () => {
      // Arrange
      const server = await createServer(container)

      await UsersTableTestHelper.addUser(dummyUserFirst)
      await UsersTableTestHelper.addUser(dummyUserSecond)

      const accessToken = await LoginTestHelper.login(dummyUserSecond)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: validTestUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(403)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('akses hapus reply tidak diijinkan')
    })

    it('should respond 200 status code', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await LoginTestHelper.login(dummyUserFirst)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: validTestUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })
  })
})