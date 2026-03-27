"use client";

const SCENE_LABELS = [
  "Home",
  "School",
  "Market",
  "Hospital",
  "Tech Park",
  "Creative Hub",
  "Crossroads",
  "Start",
];

interface ScrollProgressProps {
  totalScenes: number;
  activeScene: number;
}

export default function ScrollProgress({
  totalScenes,
  activeScene,
}: ScrollProgressProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2.5 shadow-lg shadow-black/60 backdrop-blur-xl ring-1 ring-white/10">
        {Array.from({ length: totalScenes }).map((_, idx) => {
          const isActive = idx === activeScene;
          return (
            <div
              key={idx}
              className="relative flex items-center"
              title={SCENE_LABELS[idx] || `Scene ${idx + 1}`}
            >
              <div
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? "h-2.5 w-6 bg-gradient-to-r from-violet-400 to-fuchsia-400 shadow-md shadow-violet-500/50"
                    : idx < activeScene
                    ? "h-2 w-2 bg-violet-400/50"
                    : "h-2 w-2 bg-white/20"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
