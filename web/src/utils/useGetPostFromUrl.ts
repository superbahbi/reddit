import { usePostQuery } from "../generated/graphql";
import { usegetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
  const intId = usegetIntId();
  return usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
};
