"use client";

import { ActivityEvent } from "@/lib/types";

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="h-full overflow-y-auto scrollbar-none space-y-1.5 pr-1">
      {events.length === 0 && <p className="text-xs text-white/30">Activity will show up here.</p>}
      {events.map((e, i) => (
        <div
          key={e.id}
          className={`text-xs leading-snug ${i === 0 ? "text-white/85" : "text-white/40"} transition-colors`}
        >
          {e.text}
        </div>
      ))}
    </div>
  );
}
