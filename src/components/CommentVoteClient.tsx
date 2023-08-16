"use client";

import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommentVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import { CommentVote, VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useState } from "react";

import { Button } from "./ui/Button";

type PartialVote = Pick<CommentVote, "type">;

type CommentVoteClientProps = {
  commentId: string;
  initialVoteCnt: number;
  initialVote?: PartialVote;
};

export const CommentVoteClient: React.FC<CommentVoteClientProps> = ({
  commentId,
  initialVoteCnt,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesCnt, setVotesCnt] = useState(initialVoteCnt);
  const [currentVote, setCurrentVote] = useState<PartialVote | undefined>(
    initialVote
  );
  const prevVote = usePrevious(currentVote);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/comment/vote", payload);
    },
    onMutate: (voteType: VoteType) => {
      // optimistic render
      if (currentVote?.type === voteType) {
        // User is voting the same way again, so remove their vote
        setCurrentVote(undefined);
        if (voteType === "UP") setVotesCnt((prev) => prev - 1);
        else if (voteType === "DOWN") setVotesCnt((prev) => prev + 1);
      } else {
        // User is voting in the opposite direction, so subtract 2
        setCurrentVote({ type: voteType });
        if (voteType === "UP")
          setVotesCnt((prev) => prev + (currentVote ? 2 : 1));
        else if (voteType === "DOWN")
          setVotesCnt((prev) => prev - (currentVote ? 2 : 1));
      }
    },
    onError: (err, voteType) => {
      // optimistic render reset
      if (voteType === "UP") {
        setVotesCnt((prev) => prev - 1);
      } else {
        setVotesCnt((prev) => prev + 1);
      }

      // reset current vote
      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "SOMETHING WONG!",
        description: "SOMETHING WONG!",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="ghost"
        aria-label="upvote"
        onClick={() => vote("UP")}
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote?.type === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesCnt}
      </p>

      <Button
        size="sm"
        variant="ghost"
        aria-label="downvote"
        onClick={() => vote("DOWN")}
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};
