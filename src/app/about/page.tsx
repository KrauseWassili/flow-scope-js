export default function Page() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="max-w-3xl w-full space-y-4">
        {/* Title */}
        <div className="space-y-3 pt-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            About FlowScope JS
          </h1>
          <p className="text-title text-lg">
            A developer-focused tool for inspecting backend flows and traces.
          </p>
        </div>

        {/* What is it */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            What is FlowScope JS?
          </h2>
          <p className="text-value leading-relaxed">
            FlowScope JS is an experimental observability UI designed to explore
            how backend events propagate through systems over time. It focuses
            on clarity, determinism, and developer-oriented interaction rather
            than dashboards or aggregated metrics.
          </p>
          <p className="text-value leading-relaxed">
            The core idea is simple: represent a backend flow as a sequence of
            events, visualize it across system nodes, and allow precise,
            step-by-step inspection of what happened and when.
          </p>
        </section>

        {/* Why */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Why this project exists
          </h2>
          <p className="text-value leading-relaxed">
            Many existing observability tools focus on metrics, charts, and
            high-level summaries. While powerful, they often make it difficult
            to understand the exact sequence of events that led to a specific
            behavior or failure.
          </p>
          <p className="text-value leading-relaxed">
            FlowScope JS was created as an experimental project to explore a
            different approach: treating traces as first-class, navigable
            timelines and providing direct access to individual events and their
            payloads.
          </p>
        </section>

        {/* Key ideas */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Key ideas and principles
          </h2>
          <ul className="list-disc list-inside space-y-2 text-value">
            <li>
              <span className="font-medium text-foreground">
                Event-first model
              </span>{" "}
              — every trace is built from explicit events, not derived metrics.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Deterministic replay
              </span>{" "}
              — traces can be replayed step by step with predictable state.
            </li>
            <li>
              <span className="font-medium text-foreground">
                System-level visualization
              </span>{" "}
              — events are mapped to logical nodes to reveal flow structure.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Developer-oriented UX
              </span>{" "}
              — keyboard navigation, minimal UI noise, and inspectable state.
            </li>
          </ul>
        </section>

        {/* Scope */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Scope and limitations
          </h2>
          <p className="text-value leading-relaxed">
            FlowScope JS is not intended to replace production-grade
            observability platforms. It does not aim to cover alerting,
            long-term storage, or large-scale aggregation.
          </p>
          <p className="text-value leading-relaxed">
            Instead, it serves as a focused exploration of tracing UX and
            interaction patterns, suitable for demos, experiments, and learning
            purposes.
          </p>
        </section>

        {/* Footer note */}
        <p className="text-xs text-title">
          FlowScope JS is an open-source project built to explore ideas around
          tracing, observability, and developer tooling UX.
        </p>
      </div>
    </main>
  );
}
