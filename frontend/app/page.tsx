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
      <div className="absolute inset-0 bg-gradient-to-b from-purple-deep/25 via-purple-deep/55 to-black/75" />

      <div className="relative z-10 flex h-full flex-col">
        <Header transparent />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-8 pb-6 pt-16">
          {/* Hero */}
          <section className="mb-10 flex flex-col items-center gap-3 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-6xl">
              <span>Gators</span>
              <span className="text-gold">List</span>
            </h1>
            <p className="max-w-xl text-sm text-white/90 sm:text-base">
              The student marketplace for San Francisco State University. Buy,
              sell, and trade with fellow Gators.
            </p>
          </section>

          <FeaturedItemsSection />
        </main>
      </div>
    </div>
  );
}
