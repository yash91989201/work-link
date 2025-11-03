import { useRouteContext } from "@tanstack/react-router";

export const useAuthedSession = () => {
  const { session } = useRouteContext({
    from: "/(authenticated)",
  });

  return {
    session: session.session,
    user: session.user,
  };
};
