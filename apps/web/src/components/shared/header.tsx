import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { ModeToggle } from "./mode-toggle";
import { MyOrgButton, MyOrgButtonSkeleton } from "./my-org-button";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [{ to: "/", label: "Home" }] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Suspense fallback={<MyOrgButtonSkeleton />}>
            <MyOrgButton />
          </Suspense>
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
