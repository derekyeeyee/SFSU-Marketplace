import Image from "next/image";
import Header from "@/app/components/Header";
import FeaturedItemsSection from "@/app/components/FeaturedItemsSection";

export default function Home() {
  return (
    <div className="relative h-screen overflow-hidden">
      <Image
        src="/SFSU Backdrop.jpg"
        alt="San Francisco State University campus"
        fill
        priority
        className="object-cover"
      />
      {/* Refined gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-deep/30 via-purple-deep/50 to-black/80" />
      {/* Dot pattern overlay for texture */}
      <div className="absolute inset-0 dot-pattern-light opacity-30" />

      <div className="relative z-10 flex h-full flex-col">
        <Header transparent />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-8 pb-6 pt-10">
          {/* Hero */}
          <section className="mb-8 flex flex-col items-center gap-4 text-center animate-fade-in-up">
            {/* Logo + Title inline */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0">
                <Image
                  src="/SFSULogo.png"
                  alt="SFSU Gator"
                  fill
                  className="object-contain drop-shadow-lg"
                  sizes="80px"
                />
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-6xl lg:text-7xl font-[family-name:var(--font-heading)]">
                <span>Gators</span>
                <span className="gradient-text-gold">List</span>
              </h1>
            </div>

            <p className="max-w-lg text-base text-white/70 leading-relaxed sm:text-lg">
              The student marketplace for San Francisco State University.
            </p>

            <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/15 glass-dark px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-medium text-white/70 tracking-wide">
                Buy, sell, and trade with fellow Gators
              </span>
            </div>
          </section>

          <FeaturedItemsSection />
        </main>
      </div>
    </div>
  );
}
