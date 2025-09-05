import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { buttonVariants } from "./ui/button";

export default function Header() {
  return (
    <div>
      <nav className="container mx-auto flex flex-row items-center justify-between px-2 py-1">
        <Link className="flex items-center gap-2" to="/">
          <picture>
            <source srcSet="/logo.webp" type="image/webp" />
            <img
              alt="Logo"
              height={60}
              loading="lazy"
              src="/logo.webp"
              width={60}
            />
          </picture>
          <h1 className="font-semibold text-2xl">Work Link</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/signin" className={buttonVariants({ variant: "outline" })}>
            Sign In
          </Link>
          <ModeToggle />
          <UserMenu />
        </div>
      </nav>
      <hr />
    </div>
  );
}
