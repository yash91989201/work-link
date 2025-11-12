import { Link, useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveOrgSlug } from "@/hooks/use-active-org-slug";
import { useMemberRole } from "@/hooks/use-member-role";
import { useSession } from "@/hooks/use-session";
import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const navigate = useNavigate();
  const session = useSession();
  const role = useMemberRole();

  const slug = useActiveOrgSlug();

  if (!session) {
    return (
      <Button asChild variant="outline">
        <Link to="/login">LogIn</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{session.user.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="space-y-1.5 bg-card">
        <DropdownMenuLabel className="space-x-1.5">
          <span>My Account</span>
          {role !== null ? <Badge>{role}</Badge> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{session.user.email}</DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link params={{ slug: slug ?? "" }} to="/org/$slug/account">
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link params={{ slug: slug ?? "" }} to="/org/$slug/settings">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  navigate({
                    to: "/",
                  });
                },
              },
            });
          }}
          variant="destructive"
        >
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
