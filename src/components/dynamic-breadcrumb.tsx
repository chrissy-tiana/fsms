"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

// Helper to prettify segment names
function prettifySegment(segment: string) {
  // Remove query/hash, replace dashes/underscores, capitalize words
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/\d+$/, (num) => ` #${num}`); // e.g. "user-123" -> "User #123"
}

const DynamicBreadcrumb: React.FC = () => {
  const pathname = usePathname();

  // Remove query/hash, split, and filter empty
  const pathSegments = pathname.split(/[?#]/)[0].split("/").filter(Boolean);

  // Build cumulative paths for each segment
  const crumbs = pathSegments.map((segment, idx) => {
    const href = "/" + pathSegments.slice(0, idx + 1).join("/");
    return {
      label: prettifySegment(segment),
      href,
    };
  });

  // Don't show breadcrumb on home page
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-fit border px-8 rounded-full">
      <ol className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
        <li>
          <Link
            href="/"
            className="hover:underline text-gray-700 font-medium flex items-center"
            aria-label="Home"
          >
            Home
          </Link>
        </li>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <li aria-hidden="true" className="px-1">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              {idx === crumbs.length - 1 ? (
                <span
                  className="text-gray-900 font-semibold"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:underline text-gray-700"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default DynamicBreadcrumb;
