import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostComment } from "./PostComment";
import { CreateComment } from "./CreateComment";

type CommentsSectionProps = {
  postId: string;
};

export const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const session = await getAuthSession();
  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesCnt = topLevelComment.votes.voteCount();
            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user?.id
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    comment={topLevelComment}
                    postId={postId}
                    currentVote={topLevelCommentVote}
                    votesCnt={topLevelCommentVotesCnt}
                  />
                </div>

                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    const replyVoteCnt = reply.votes.voteCount();
                    const replyVote = reply.votes.find(
                      (vote) => vote.userId === session?.user?.id
                    );

                    return (
                      <div
                        key={reply.id}
                        className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                      >
                        <PostComment
                          comment={reply}
                          currentVote={replyVote}
                          votesCnt={replyVoteCnt}
                          postId={postId}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};