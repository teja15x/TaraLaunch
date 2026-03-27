"use client";

interface Feature {
  icon: string;
  title: string;
  description: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    icon: "🤖",
    title: "AI Career Buddy",
    description:
      "Natural conversations that understand your personality, not just your marks.",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: "🎮",
    title: "Assessment Games",
    description:
      "Fun games that secretly measure your strengths across 3 psychology frameworks.",
    accent: "from-emerald-400 to-teal-400",
  },
  {
    icon: "📊",
    title: "RIASEC + Gardner + Big Five",
    description:
      "Triple-framework assessment used by real career counselors.",
    accent: "from-sky-400 to-cyan-400",
  },
  {
    icon: "🇮🇳",
    title: "Made for India",
    description:
      "Career paths, exams, and colleges specific to the Indian education system.",
    accent: "from-amber-400 to-orange-400",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Parent Dashboard",
    description:
      "Parents see strengths and recommendations without accessing private chats.",
    accent: "from-pink-400 to-rose-400",
  },
  {
    icon: "🔒",
    title: "Private & Safe",
    description:
      "Your conversations stay private. No data shared. Age-appropriate interactions.",
    accent: "from-slate-400 to-zinc-300",
  },
];

export default function FeaturesGrid() {
  return (
    <section
      id="features"
      className="relative border-t border-white/5 bg-gradient-to-b from-black/80 via-[#050515] to-black py-20 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute right-16 bottom-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Why{" "}
            <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              Career Agent?
            </span>
          </h2>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            A complete journey from self-discovery to confident career choices,
            built especially for Indian students.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-5 shadow-lg shadow-black/40 backdrop-blur-xl transition hover:-translate-y-1.5 hover:border-violet-400/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-lg shadow-inner shadow-black/50 bg-clip-padding text-white"
                  style={{ backgroundImage: undefined }}
                >
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent}`}
                  >
                    <span>{feature.icon}</span>
                  </div>
                </div>
                <h3 className="mb-2 text-base font-semibold sm:text-lg">
                  {feature.title}
                </h3>
                <p className="text-xs text-white/65 sm:text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

