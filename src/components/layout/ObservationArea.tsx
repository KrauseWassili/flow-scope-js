import { SystemEvent } from "@/lib/events";
import EventTimeline from "../observation/EventTimeline";

type ObservationAreaProps = {
  events: SystemEvent[];
};

export default function ObservationArea({ events }: ObservationAreaProps) {

  return (
    <div>
      <h2>System map</h2>
      <EventTimeline events={events} />
      <h3>User</h3>
      <h3>Messenger</h3>
      <h3>Redis</h3>
      <h3>Supabase</h3>
    </div>
  );
}
