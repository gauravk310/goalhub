"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;

interface NavLinkProps extends Omit<LinkProps, "href"> {
  href?: string;
  to?: string; // Alias for href to maintain compatibility
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName, to, href, ...props }, ref) => {
    const pathname = usePathname();
    const targetHref = to || href || "";

    // Determine if the link is active
    // This logic mimics basic react-router behavior: exact match or subpath match
    const isActive = pathname === targetHref;

    return (
      <Link
        ref={ref}
        href={targetHref}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
