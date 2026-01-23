import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8 pt-12">
        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            FlowScope JS
          </h1>
          <p className="text-title text-lg md:text-xl">
            Inspect backend flows and traces in real time
          </p>
          <p className="text-title text-sm opacity-80">
            Built for backend and full-stack developers debugging complex flows
          </p>
        </div>

        <Image
          className="rounded-2xl"
          src="/og-image-1200x630.png"
          alt="flowscopejs"
          width={1200}
          height={630}
        />

        {/* CTA */}
        <div className="flex items-center justify-center gap-4">
          <Link href="/app" className="btn-home">
            Open app
          </Link>

          <a
            href="https://github.com/KrauseWassili/flow-scope-js"
            target="_blank"
            rel="noreferrer"
            className="btn-home bg-foreground! text-background! hover:bg-background! hover:text-foreground!"
          >
            View on GitHub
          </a>
        </div>

        {/* Feature list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center sm:text-right">
            <Feature
              title="Live & replay traces"
              description="Observe backend flows in real time or replay recorded traces step by step."
            />
            <Feature
              title="System-level visualization"
              description="Understand how events propagate through services and nodes."
            />
          </div>

          <div className="text-center sm:text-left">
            <Feature
              title="Event-level inspection"
              description="Inspect payloads, metadata and timing for each individual event."
            />
            <Feature
              title="Developer-focused UX"
              description="Keyboard-friendly navigation and clear, deterministic state."
            />
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-title">
          Open-source project exploring observability and tracing UI.
        </p>
      </div>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-value leading-relaxed pb-1">{description}</p>
    </div>
  );
}
