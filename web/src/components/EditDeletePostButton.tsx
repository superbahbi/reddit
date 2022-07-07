import { Box, IconButton, Link } from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
interface EditDeletePostButtonProps {
  id: number;
  creatorId: number;
}

const EditDeletePostButton: React.FC<EditDeletePostButtonProps> = ({
  id,
  creatorId,
}) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data: meData }] = useMeQuery();
  if (meData?.me?.id !== creatorId) {
    return null;
  }
  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton as={Link} mr={4} icon="edit" aria-label="edit post" />
      </NextLink>

      <IconButton
        variantColor="red"
        icon="delete"
        aria-label="delete post"
        onClick={() => {
          deletePost({ id });
        }}
      />
    </Box>
  );
};
export default EditDeletePostButton;
