import { Flex, IconButton } from "@chakra-ui/core";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}

const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("upvote-loading");
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        variantColor={post.voteStatus === 1 ? "teal" : undefined}
        isLoading={loadingState === "upvote-loading"}
        icon="chevron-up"
        aria-label="Upvote"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downvote-loading");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        variantColor={post.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downvote-loading"}
        icon="chevron-down"
        aria-label="Downvote"
      />
    </Flex>
  );
};
export default UpvoteSection;
