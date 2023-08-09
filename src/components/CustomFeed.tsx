import { PostFeed } from "@/components/PostFeed";

import { getAuthSession } from "../lib/auth";
import { db } from "@/lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";

export async function CustomFeed() {
  const session = await getAuthSession();

  const followed = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subreddit: true,
    },
  });

  const followedIds = followed.map(({ subreddit }) => subreddit.id);

  const posts = await db.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedIds,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });

  return <PostFeed initialPosts={posts} />;
}
