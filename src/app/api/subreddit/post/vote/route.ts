import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { PostVoteValidator } from '@/lib/validators/vote';
import { CachedPost } from '@/types/redis';
import { z } from 'zod';

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return new Response('UNAUTHORIZED', { status: 401 })
    }

    const body = await req.json()
    const { postId, voteType } = PostVoteValidator.parse(body)

    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId
      }
    })

    const existingPost = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true
      }
    })

    if (!existingPost) {
      return new Response('Not found', { status: 404 })
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id
            }
          }
        })
        return new Response("OK")
      }

      await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id
          },
        },
        data: {
          type: voteType
        }
      })

      // recount the votes
      const votesCnt = existingPost.votes.reduce((acc, vote) => {
        if (vote.type === 'UP') return acc + 1
        if (vote.type === 'DOWN') return acc - 1
        return acc
      }, 0)

      if (votesCnt >= CACHE_AFTER_UPVOTES) {
        const cachedPost: CachedPost = {
          id: existingPost.id,
          authorUsername: existingPost.author.username ?? '',
          content: JSON.stringify(existingPost.content),
          title: existingPost.title,
          currentVote: voteType,
          createdAt: existingPost.createdAt
        }

        await redis.hset(`post:${postId}`, cachedPost)
      }

      return new Response('OK')
    }

    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId,
      }
    })

    // recount the votes
    const votesCnt = existingPost.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') return acc + 1
      if (vote.type === 'DOWN') return acc - 1
      return acc
    }, 0)

    if (votesCnt >= CACHE_AFTER_UPVOTES) {
      const cachedPost: CachedPost = {
        id: existingPost.id,
        authorUsername: existingPost.author.username ?? '',
        content: JSON.stringify(existingPost.content),
        title: existingPost.title,
        currentVote: voteType,
        createdAt: existingPost.createdAt
      }

      await redis.hset(`post:${postId}`, cachedPost)
    }
    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 })
    }

    return new Response('Could not vote', { status: 500 })
  }
}
