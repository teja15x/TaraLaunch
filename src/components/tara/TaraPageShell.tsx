'use client';

export function TaraPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
        <p className="max-w-3xl text-white/70">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}
