export default function Page() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-6">
      <div className="max-w-3xl w-full space-y-10">
        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Usage
          </h1>
          <p className="text-title text-lg">
            How to work with traces and events in FlowScope JS
          </p>
        </div>

        {/* Overview */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <p className="text-value leading-relaxed">
            FlowScope JS visualizes backend execution in the form of traces —
            sequences of events that occur within a single user action or
            logical flow (for example, a login or a message exchange).
          </p>
          <p className="text-value leading-relaxed">
            Each trace consists of ordered events passing through different
            system nodes such as clients, WebSocket, API, cache, and database.
          </p>
          <p className="text-value leading-relaxed">
            The interface is divided into three main areas: the event generation
            panel, the system map with trace timeline, and the event inspector.
            This allows you to analyze flows as a whole or step by step at the
            level of individual events.
          </p>
        </section>

        {/* Sending and generating events */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Sending and generating events
          </h2>
          <p className="text-value leading-relaxed">
            Events in FlowScope JS can appear in two ways. The first is through
            user actions performed in the chat panel on the left, such as
            sending a message or logging in.
          </p>
          <p className="text-value leading-relaxed">
            The second way is explicit event generation directly from
            application code.
          </p>
          <p className="text-value leading-relaxed">
            Each user action or generated event initiates backend processing
            that is immediately reflected on the system map and added to the
            trace timeline.
          </p>
        </section>

        {/* Trace events in code */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Generating trace events in code
          </h2>

          <p className="text-value leading-relaxed">
            To add events to traces, the project uses a standardized trace event
            function (internally referred to as a “beacon”).
          </p>

          <p className="text-value leading-relaxed">
            This function accepts a parameter object whose fields can be
            populated by the developer with any relevant information available
            at the current execution point.
          </p>

          <p className="text-value leading-relaxed">
            When such a beacon is executed, a new event appears in the trace
            timeline. If multiple beacons share the same <code>traceId</code>,
            they are grouped into a single trace.
          </p>

          {/* 👇 Code example goes here */}
        </section>

        <pre className="rounded-md bg-muted px-4 py-3 text-sm overflow-x-auto">
          <code className="text-foreground">
            {`sendTraceEvent({
  traceId,
  type,
  node,
  actorId: user.id,
  outcome: "error",
  error: { message: "selfId is required" },
  timestamp: Date.now(),
});`}
          </code>
        </pre>

        {/* System map */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">System map</h2>
          <p className="text-value leading-relaxed">
            The system map provides a high-level view of the logical nodes
            involved in a trace, such as clients, the WebSocket layer, cache,
            API, database, and other services.
          </p>
          <p className="text-value leading-relaxed">
            During trace playback or selection, nodes are highlighted as events
            pass through them. This makes it easy to understand which components
            participated in the flow, in what order, and where an error occurred
            if one was produced.
          </p>
        </section>

        {/* Trace timeline */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Trace timeline
          </h2>
          <p className="text-value leading-relaxed">
            The trace timeline displays all recorded traces in chronological
            order. Each row corresponds to a single trace and shows compact
            visual indicators of node-level activity.
          </p>
          <p className="text-value leading-relaxed">
            Selecting a trace focuses the system map on that flow and enables
            step-by-step inspection of its events.
          </p>
        </section>

        {/* Selecting events */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Selecting events
          </h2>
          <p className="text-value leading-relaxed">
            To display a specific event in the event inspector, click on a
            system node in the system map or on an individual event indicator in
            the trace timeline.
          </p>
          <p className="text-value leading-relaxed">
            Once selected, the event inspector automatically updates to show
            detailed information for that exact step of the flow.
          </p>
        </section>

        {/* Event inspector */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Event inspector
          </h2>
          <p className="text-value leading-relaxed">
            The event inspector displays the full information of the selected
            event without aggregation or simplification.
          </p>
          <p className="text-value leading-relaxed">
            This includes event type, trace and action identifiers, system node,
            timestamp, execution outcome, and the full payload.
          </p>
          <p className="text-value leading-relaxed">
            This level of detail allows you to precisely understand what
            happened at each step of a flow.
          </p>
        </section>

        {/* Live and replay */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Live mode and replay
          </h2>
          <p className="text-value leading-relaxed">
            In live mode, incoming events are appended to the trace timeline in
            real time.
          </p>
          <p className="text-value leading-relaxed">
            Replay mode allows you to pause playback, move forward and backward
            through events, and control playback speed.
          </p>
          <p className="text-value leading-relaxed">
            This makes it possible to deterministically analyze complex flows
            and understand the exact order and timing of events.
          </p>
        </section>

        {/* Footer */}
        <p className="text-xs text-title pt-6">
          FlowScope JS focuses on event-level transparency and trace navigation
          rather than metrics, alerting, or long-term data storage.
        </p>
      </div>
    </main>
  );
}
