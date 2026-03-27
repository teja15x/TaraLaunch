"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SceneLabel from "./SceneLabel";

gsap.registerPlugin(ScrollTrigger);

interface JourneySceneProps {
  totalScenes: number;
  onSceneChange?: (index: number) => void;
}

const SCENES = [
  {
    id: 0,
    key: "home",
    title: "Every journey starts at home",
    subtitle: "\u201CWhat will I become?\u201D",
    sky: "#f59e0b",
    skyEnd: "#fde68a",
  },
  {
    id: 1,
    key: "school",
    title: "The classroom shapes us",
    subtitle: "\u201CThere must be more than marks\u2026\u201D",
    sky: "#87CEEB",
    skyEnd: "#E0F7FA",
  },
  {
    id: 2,
    key: "market",
    title: "The world is full of possibilities",
    subtitle: "\u201CWhich one is mine?\u201D",
    sky: "#f59e0b",
    skyEnd: "#fde68a",
  },
  {
    id: 3,
    key: "hospital",
    title: "Some heal the world",
    subtitle: "\u201CCould I save lives?\u201D",
    sky: "#E8F5E9",
    skyEnd: "#B2DFDB",
  },
  {
    id: 4,
    key: "tech-park",
    title: "Some build the future",
    subtitle: "\u201CCould I create something amazing?\u201D",
    sky: "#7B1FA2",
    skyEnd: "#E1BEE7",
  },
  {
    id: 5,
    key: "creative-hub",
    title: "Some paint it beautiful",
    subtitle: "\u201CWhat if my passion is my career?\u201D",
    sky: "#FF6F00",
    skyEnd: "#F06292",
  },
  {
    id: 6,
    key: "crossroads",
    title: "Every path leads somewhere",
    subtitle: "\u201CBut which path is YOURS?\u201D",
    sky: "#4c1d95",
    skyEnd: "#0f172a",
  },
  {
    id: 7,
    key: "cta",
    title: "Let\u2019s find out together",
    subtitle: "\u201CYour journey begins now.\u201D",
    sky: "#1a1a2e",
    skyEnd: "#16213e",
  },
] as const;

const SCENE_COUNT = SCENES.length;

export default function JourneyScene({
  totalScenes,
  onSceneChange,
}: JourneySceneProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const bicycleRef = useRef<HTMLDivElement | null>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [isPinned, setIsPinned] = useState(true);
  const sceneCount = Math.min(Math.max(totalScenes, 1), SCENE_COUNT);

  const handleSceneChange = useCallback(
    (index: number) => {
      setActiveScene(index);
      if (onSceneChange) onSceneChange(index);
    },
    [onSceneChange]
  );

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    if (window.innerWidth < 768) return; // mobile: stacked, no GSAP

    const ctx = gsap.context(() => {
      /*
       * Bulletproof GSAP horizontal scroll pattern:
       * - Track width = SCENE_COUNT * 100vw  (set via inline style)
       * - xPercent = -100 * (N-1) / N  (percentage of track's own width)
       *   For 8 scenes: -100 * 7/8 = -87.5%  → moves 700vw left → last scene visible
       * - Scroll distance = track.offsetWidth  (total px width of the strip)
       *
       * This guarantees each scene aligns perfectly with a scroll segment.
       */
      const endPercent = (100 * (sceneCount - 1)) / sceneCount;

      const scrollTween = gsap.to(track, {
        xPercent: -endPercent,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // scroll distance = total track width in px
          end: () => `+=${track.scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const raw = self.progress * (sceneCount - 1);
            const idx = Math.min(Math.round(raw), sceneCount - 1);
            handleSceneChange(idx);
          },
          onEnter: () => setIsPinned(true),
          onEnterBack: () => setIsPinned(true),
          onLeave: () => setIsPinned(false),
          onLeaveBack: () => setIsPinned(false),
        },
      });

      // Bicycle bob
      if (bicycleRef.current) {
        gsap.to(bicycleRef.current, {
          y: -5,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // Per-scene entrance animations (skip scene 0 — always visible)
      SCENES.forEach((scene) => {
        if (scene.id === 0) return;
        const el = document.querySelector(`[data-scene="${scene.key}"]`);
        if (!el) return;

        el.querySelectorAll(".scene-element").forEach((child, j) => {
          gsap.fromTo(
            child,
            { opacity: 0, y: 30, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              delay: j * 0.08,
              scrollTrigger: {
                trigger: el,
                containerAnimation: scrollTween,
                start: "left 75%",
                end: "left 30%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      });
    }, section);

    return () => ctx.revert();
  }, [handleSceneChange, sceneCount]);

  /* ------------------------------------------------------------------ */
  return (
    // IMPORTANT: NO overflow-hidden on this section — GSAP pins it
    <section ref={sectionRef} className="relative h-screen w-full">
      {/* ===== Sky — crossfades behind everything ===== */}
      <div className="absolute inset-0 z-0">
        {SCENES.map((scene) => (
          <div
            key={scene.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: `linear-gradient(to bottom, ${scene.sky}, ${scene.skyEnd})`,
              opacity: activeScene === scene.id ? 1 : 0,
            }}
          />
        ))}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: activeScene === 0 ? 0.55 : 0 }}
        >
          <Image
            src="/images/landing/sunrise-sky.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/*
        Clip wrapper — this is what hides the off-screen scenes.
        It sits INSIDE the pinned section, NOT on the section itself.
      */}
      <div className="relative z-[1] h-full w-full overflow-hidden">
        {/* ===== Horizontal track ===== */}
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ width: `${SCENE_COUNT * 100}vw` }}
        >
          {SCENES.map((scene) => (
            <div
              key={scene.id}
              data-scene={scene.key}
              className="relative h-full flex-shrink-0"
              style={{ width: "100vw" }}
            >
              {/* Ground gradient */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-28 bg-gradient-to-t from-black/80 via-slate-900/50 to-transparent" />

              {/* Scene environment art */}
              <div className="relative z-[2] flex h-full w-full items-end justify-center">
                {renderSceneContent(scene.key)}
              </div>

              {/* Scene label — below navbar */}
              <div className="absolute left-0 right-0 top-20 z-10 px-6 sm:px-12">
                <SceneLabel
                  title={scene.title}
                  subtitle={scene.subtitle}
                  align={
                    scene.key === "cta" || scene.key === "crossroads"
                      ? "center"
                      : scene.id <= 1
                      ? "left"
                      : scene.id >= 5
                      ? "right"
                      : "center"
                  }
                  active={activeScene === scene.id}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Bicycle boy — absolute inside pinned section, fades on unpin ===== */}
      <div
        className={`pointer-events-none absolute bottom-20 left-6 z-20 transition-opacity duration-300 sm:bottom-24 sm:left-10 md:left-14 ${
          isPinned ? "opacity-100" : "opacity-0"
        }`}
      >
        <div ref={bicycleRef} className="relative w-32 sm:w-44 md:w-52">
          <Image
            src="/images/landing/bicycle-boy.png"
            alt="Student cycling through career journey"
            width={800}
            height={800}
            priority
            className="drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene content — extracted for readability                          */
/* ------------------------------------------------------------------ */
function renderSceneContent(key: string) {
  switch (key) {
    case "home":
      return (
        <>
          <div className="scene-element absolute bottom-0 right-[10%] w-[260px] sm:w-[340px] md:w-[420px]">
            <Image src="/images/landing/home.png" alt="Home" width={800} height={600} className="drop-shadow-2xl" />
          </div>
          <div className="scene-element absolute bottom-0 left-[5%] w-[200px] sm:w-[280px] md:w-[360px]">
            <Image src="/images/landing/trees.png" alt="Trees" width={800} height={600} className="opacity-80 drop-shadow-xl" />
          </div>
          <div className="scene-element absolute bottom-0 right-[45%] w-[120px] sm:w-[160px] md:w-[200px]">
            <Image src="/images/landing/trees.png" alt="Trees" width={800} height={600} className="opacity-40 drop-shadow-lg" />
          </div>
        </>
      );

    case "school":
      return (
        <>
          <div className="scene-element absolute bottom-0 right-[8%] w-[300px] sm:w-[400px] md:w-[500px]">
            <Image src="/images/landing/school.png" alt="School" width={1000} height={600} className="drop-shadow-2xl" />
          </div>
          <div className="scene-element absolute bottom-0 left-[15%] w-[100px] sm:w-[130px] md:w-[160px]">
            <Image src="/images/landing/teacher.png" alt="Teacher" width={500} height={500} className="drop-shadow-lg" />
          </div>
        </>
      );

    case "market":
      return (
        <div className="scene-element absolute bottom-0 left-1/2 w-[380px] -translate-x-1/2 sm:w-[500px] md:w-[620px]">
          <Image src="/images/landing/market.png" alt="Market" width={1200} height={600} className="drop-shadow-2xl" />
        </div>
      );

    case "hospital":
      return (
        <>
          <div className="scene-element absolute bottom-0 right-[8%] w-[300px] sm:w-[400px] md:w-[500px]">
            <Image src="/images/landing/hospital.png" alt="Hospital" width={1000} height={600} className="drop-shadow-2xl" />
          </div>
          <div className="scene-element absolute bottom-0 left-[12%] w-[100px] sm:w-[130px] md:w-[160px]">
            <Image src="/images/landing/doctor.png" alt="Doctor" width={400} height={400} className="drop-shadow-lg" />
          </div>
        </>
      );

    case "tech-park":
      return (
        <>
          <div className="scene-element absolute bottom-0 right-[8%] w-[320px] sm:w-[440px] md:w-[540px]">
            <Image src="/images/landing/tech-park.png" alt="Tech Park" width={1400} height={700} className="drop-shadow-2xl" />
          </div>
          <div className="scene-element absolute bottom-0 left-[10%] w-[100px] sm:w-[130px] md:w-[160px]">
            <Image src="/images/landing/engineer.png" alt="Engineer" width={400} height={400} className="drop-shadow-lg" />
          </div>
        </>
      );

    case "creative-hub":
      return (
        <>
          <div className="scene-element absolute bottom-0 left-1/2 w-[320px] -translate-x-1/2 sm:w-[440px] md:w-[540px]">
            <Image src="/images/landing/creative-hub.png" alt="Creative Hub" width={1200} height={700} className="drop-shadow-2xl" />
          </div>
          <div className="scene-element absolute bottom-0 right-[8%] w-[100px] sm:w-[130px] md:w-[160px]">
            <Image src="/images/landing/artist.png" alt="Artist" width={400} height={400} className="drop-shadow-lg" />
          </div>
        </>
      );

    case "crossroads":
      return (
        <div className="scene-element absolute inset-0">
          <Image src="/images/landing/crossroads.png" alt="Career Crossroads" fill className="object-cover object-bottom" />
        </div>
      );

    case "cta":
      return (
        <>
          <div className="absolute inset-0 opacity-10">
            <Image src="/images/landing/road.png" alt="" fill className="object-cover object-bottom" />
          </div>
          <div className="scene-element relative z-10 mb-20 flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-2xl shadow-violet-800/50 sm:h-24 sm:w-24">
              <span className="text-3xl font-extrabold text-white sm:text-4xl">CA</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              AI-Powered Career Discovery
            </div>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                Discover who you&apos;re meant to be
              </span>
            </h2>
            <p className="max-w-md text-sm text-white/70 sm:text-base">
              Chat with AI, play games that reveal your strengths, and find careers that truly fit who you are.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <a
                href="/roles"
                className="group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-10 py-4 text-base font-bold shadow-xl shadow-violet-800/40 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-violet-700/60"
              >
                <span className="absolute inset-0 animate-pulse rounded-full bg-white/10" />
                <span className="relative">Get Started</span>
              </a>
              <a
                href="#features"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white/10"
              >
                Learn More
              </a>
            </div>
          </div>
        </>
      );

    default:
      return null;
  }
}
