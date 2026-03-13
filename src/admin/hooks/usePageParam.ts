import { useCallback } from "react";
import { useSearchParams } from "react-router";

/**
 * Syncs the current page number with the `page` URL search param.
 * Defaults to page 1 when the param is absent or invalid.
 */
export function usePageParam() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const setPage = useCallback(
    (next: number) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next <= 1) {
            params.delete("page");
          } else {
            params.set("page", String(next));
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { page, setPage };
}
