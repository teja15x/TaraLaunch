"use client";

const STEPS = [
  {
    step: "01",
    title: "Sign Up",
    description: "Create your profile in 30 seconds.",
  },
  {
    step: "02",
    title: "Chat & Play",
    description: "Talk to Career Buddy and play assessment games.",
  },
  {
    step: "03",
    title: "Get Matched",
    description: "AI analyzes your psychology across 19 dimensions.",
  },
  {
    step: "04",
    title: "Discover Your Path",
    description: "See your top 5 career matches with education roadmaps.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-white/5 bg-white/[0.03] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            A simple four-step journey from confusion to clarity.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="flex flex-col items-center rounded-2xl border border-white/10 bg-black/30 px-5 py-6 text-center shadow-lg shadow-black/40"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/70 to-fuchsia-500/80 text-lg font-bold shadow-inner shadow-black/60">
                {s.step}
              </div>
              <h3 className="mb-2 text-sm font-semibold sm:text-base">
                {s.title}
              </h3>
              <p className="text-xs text-white/65 sm:text-sm">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

