import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { AppNotification } from "@/types";

interface NotificationItemProps {
  notification: AppNotification;
  /** Where clicking should go; null renders a plain button that only marks it read. */
  href: string | null;
  onOpen: (notification: AppNotification) => void;
}

const itemClasses = (unread: boolean) =>
  cn(
    "block w-full text-left px-4 py-3 border-b border-foreground/5 last:border-b-0 hover:bg-secondary transition-colors",
    unread && "bg-secondary/60"
  );

export function NotificationItem({ notification: n, href, onOpen }: NotificationItemProps) {
  const content = (
    <div className="flex items-start gap-2">
      <span
        aria-hidden
        className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", n.isRead ? "bg-transparent" : "bg-primary")}
      />
      <div className="min-w-0">
        <p className="text-sm font-bold">
          {!n.isRead && <span className="sr-only">Unread: </span>}
          {n.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{formatRelativeTime(n.createdAt)}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={itemClasses(!n.isRead)} onClick={() => onOpen(n)}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={itemClasses(!n.isRead)} onClick={() => onOpen(n)}>
      {content}
    </button>
  );
}