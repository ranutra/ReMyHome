"user client";

import { useMutation } from "convex/react";
import { useState } from "react";

export const useApiMutation = (mutationFunction: any) => {
  const [pending, setPending] = useState(false);
  const useApiMutation = useMutation(mutationFunction);

  const mutate = (payload: any) => {
    setPending(true);
    return useApiMutation(payload)
      .then((result) => {
        return result
      })
      .catch((error) => {
        throw error
      })
      .finally(() => setPending(false))
  };

  return{
    mutate,
    pending,
  }
}