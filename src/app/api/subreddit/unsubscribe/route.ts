import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { SubredditSubscriptionValidator } from '@/lib/validators/subreddit';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('UNAUTHORIZED', { status: 401 })
    }

    const body = await req.json()
    const { subredditId } = SubredditSubscriptionValidator.parse(body)


    const exist = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id
      }
    })

    if (!exist) {
      return new Response("You are not subscribed", { status: 400 })
    }


    // check if user is the creator of the subreddit
    const subreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id
      }
    })

    if (subreddit) {
      return new Response("You can't ubsubscribe from your own subreddit!", {
        status: 400
      })
    }

    await db.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId,
          userId: session.user.id
        }
      }
    })

    return new Response(subredditId)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response('Could not unsubscribe', { status: 500 })
  }
}