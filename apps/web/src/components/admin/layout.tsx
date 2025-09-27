import { Link, useParams } from "@tanstack/react-router";

export const AdminRootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { slug } = useParams({
    from: "/(authenticated)/org/$slug",
  });
  return (
    <div className="flex h-screen w-screen gap-1.5 overflow-hidden">
      <aside className="flex w-60 flex-col gap-3 p-1.5">
        <Link params={{ slug }} to="/org/$slug/dashboard/teams">
          Teams
        </Link>
        <Link params={{ slug }} to="/org/$slug/dashboard/members">
          Members
        </Link>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden p-1.5">
        <main className="h-full w-full rounded-sm border p-1.5">
          {children}
        </main>
      </div>
    </div>
  );
};
