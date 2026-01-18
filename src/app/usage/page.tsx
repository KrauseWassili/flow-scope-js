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
            How to work with traces and events in FlowScope JS.
          </p>
        </div>

        {/* Overview */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Overview
          </h2>
          <p className="text-value leading-relaxed">
            FlowScope JS visualizes backend activity as a sequence of traces.
            Each trace represents a single flow (for example, a login or message
            exchange) and consists of ordered events emitted by different system
            nodes.
          </p>
          <p className="text-value leading-relaxed">
            The interface is divided into a system map, a trace timeline, and an
            event inspector, allowing you to navigate flows both visually and
            step by step.
          </p>
        </section>

        {/* Chat */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Sending events
          </h2>
          <p className="text-value leading-relaxed">
            Events are generated through the chat panel on the left. Each user
            action (such as sending a message or logging in) produces backend
            events that are immediately reflected in the system map and trace
            timeline.
          </p>
          <p className="text-value leading-relaxed">
            This setup makes it easy to observe how a single interaction
            propagates through clients, services, and storage layers.
          </p>
        </section>

        {/* System Map */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            System map
          </h2>
          <p className="text-value leading-relaxed">
            The system map provides a high-level view of all logical nodes
            involved in a trace (clients, WebSocket layer, cache, API, database,
            and so on).
          </p>
          <p className="text-value leading-relaxed">
            Nodes are highlighted as events pass through them, giving an
            immediate visual indication of which parts of the system
            participated in the current flow and whether errors occurred.
          </p>
        </section>

        {/* Timeline */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Trace timeline
          </h2>
          <p className="text-value leading-relaxed">
            The trace timeline lists all recorded traces in chronological order.
            Each row corresponds to a single trace and shows node-level activity
            using compact visual indicators.
          </p>
          <p className="text-value leading-relaxed">
            Selecting a trace focuses the system map and enables detailed
            inspection of its events. In replay mode, traces can be stepped
            through sequentially.
          </p>
        </section>

        {/* Inspector */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Event inspector
          </h2>
          <p className="text-value leading-relaxed">
            The event inspector displays the full payload and metadata of the
            currently selected event, including timestamps, node identifiers,
            outcomes, and custom data.
          </p>
          <p className="text-value leading-relaxed">
            This allows precise inspection of what happened at each step of a
            flow, without aggregations or loss of detail.
          </p>
        </section>

        {/* Replay */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Live mode and replay
          </h2>
          <p className="text-value leading-relaxed">
            In live mode, incoming events are appended to the timeline in real
            time. Replay mode allows you to pause, step forward and backward,
            and control playback speed.
          </p>
          <p className="text-value leading-relaxed">
            This makes it possible to analyze complex flows deterministically
            and understand the exact order and timing of events.
          </p>
        </section>

        {/* Footer note */}
        <p className="text-xs text-title pt-6">
          FlowScope JS focuses on event-level clarity and trace navigation rather
          than metrics, alerts, or long-term storage.
        </p>
      </div>
    </main>
  );
}
