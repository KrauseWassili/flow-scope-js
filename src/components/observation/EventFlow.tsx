import { SystemEvent } from "@/lib/events";

type EventFlowProps = {
  active: boolean;
  direction: "forward" | "backward";
};

export default function EventFlow({ active, direction }: EventFlowProps) {
  return (
    <div className="relative w-6 h-1 bg-transparent">
      {active ? (
        <div
          className={`h-1 w-3 bg-amber-400 ${
            direction === "forward"
              ? "absolute left-0 animate-flow-right"
              : "absolute right-0 animate-flow-left"
          }`}
        />
      ) : null}
    </div>
  );
}
