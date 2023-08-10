import { Post, Vote, VoteType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { PostVoteClient } from "./PostVoteClient";

type PostVoteServerProps = {
  postId: string;
  initialVoteCnt?: number;
  initialVote?: VoteType | null;
  getData?: () => Promise<
    | (Post & {
        votes: Vote[];
      })
    | null
  >;
};

export const PostVoteServer = async ({
  postId,
  initialVoteCnt,
  initialVote,
  getData,
}: PostVoteServerProps) => {
  const session = await getServerSession();

  let _voteCnt: number = 0;
  let _currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const post = await getData();
    if (!post) return notFound();

    _voteCnt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;

      return acc;
    }, 0);

    _currentVote = post.votes.find(
      (vote) => vote.userId === session?.user.id
    )?.type;
  } else {
    _voteCnt = initialVoteCnt!;
    _currentVote = initialVote;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVoteCnt={_voteCnt}
      initialVote={_currentVote}
    />
  );
};
