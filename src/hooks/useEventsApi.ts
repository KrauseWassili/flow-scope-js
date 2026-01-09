import { SystemEvent } from "@/lib/events";
import { useEffect, useState } from "react";

export function useEventsApi() {
  const [data, setData] = useState<SystemEvent[] | null>(null);
  const [loading, setLoading] = useState(true);

  async function refetch() {
    setLoading(true);
    const res = await fetch("/api/events");
    const events = await res.json();
    setData(events.map((ev: any) => ({
      ...ev,
      timestamp: new Date(ev.timestamp),
    })));
    setLoading(false);
  }

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, refetch };
}
