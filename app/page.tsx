// Landing page — Frently (MVP)
// Hero with placeholder photo area, then 6 placeholder Featured slots
// (the 6 most recent rentals will populate here once listings are live).
import Link from "next/link";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { ListingCardPlaceholder } from "@/components/ListingCard";
import { Nav } from "@/components/Nav";
import { IconArrowRight } from "@/components/icons";

function Hero() {
  return (
    <section className="bg-page">
      <Container className="pt-6 pb-20">
        <div className="relative rounded-3xl overflow-hidden shadow-sm">
          <div className="aspect-[16/9] md:aspect-[2.1/1] w-full ph-stripes flex items-center justify-center">
            <span className="ph-label">hero photo</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/55" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h1
              className="text-white font-bold leading-[1.05] tracking-[-0.02em] text-[40px] sm:text-[56px] md:text-[64px] max-w-[820px] drop-shadow-sm"
              style={{ textWrap: "balance" }}
            >
              Your rental, <span className="italic font-medium">on MLS</span>.
            </h1>
            <p
              className="mt-4 text-white/85 text-[16px] md:text-[18px] max-w-[520px] leading-relaxed"
              style={{ textWrap: "pretty" }}
            >
              Ontario landlords list with Frently — we handle the MLS submission. You handle the keys.
            </p>
            <div className="mt-7 flex items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full bg-forest text-white text-[14px] font-semibold hover:bg-forest-700 transition"
              >
                List my rental <IconArrowRight size={15} color="#fff" />
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center h-11 px-6 rounded-full bg-white text-[14px] font-medium text-ink hover:bg-page transition"
              >
                Browse rentals
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeaturedListings() {
  return (
    <section id="listings" aria-labelledby="featured-heading" className="bg-page">
      <Container className="pb-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <div className="text-[12px] uppercase tracking-[0.18em] text-forest font-medium mb-2">
              Featured
            </div>
            <h2
              id="featured-heading"
              className="text-[32px] sm:text-[38px] font-bold tracking-[-0.02em] text-ink leading-[1.05]"
              style={{ textWrap: "balance" }}
            >
              Rentals live on MLS this week
            </h2>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:border-muted transition self-start sm:self-auto"
          >
            See all rentals <IconArrowRight size={14} color="currentColor" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingCardPlaceholder key={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <FeaturedListings />
      </main>
      <Footer />
    </div>
  );
}
