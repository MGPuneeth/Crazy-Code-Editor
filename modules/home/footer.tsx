import { LucideGithub } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const socialLink = [
    {
      href: "#",
      icon: (
        <LucideGithub className="w-5 h-5 text-zinc-500 dark:text-zinc-400 "></LucideGithub>
      ),
    },
  ];

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col items-center space-x-2">
        <div className="flex gap-4">
          {socialLink.map((link, index) => (
            <Link
              key={index}
              href={link.href || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.icon}
            </Link>
          ))}
        </div>

        <p>
          &copy; {new Date().getFullYear()} Codesnippet. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
