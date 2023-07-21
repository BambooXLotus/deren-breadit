import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { PostValidator } from '@/lib/validators/post';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('UNAUTHORIZED', { status: 401 })
    }

    const body = await req.json()
    const { title, content, subredditId } = PostValidator.parse(body)


    const exist = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id
      }
    })

    if (!exist) {
      return new Response("Subscribe to post", { status: 400 })
    }

    await db.post.create({
      data: {
        title,
        content,
        subredditId,
        authorId: session.user.id
      }
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 })
    }

    return new Response('Could not post', { status: 500 })
  }
}