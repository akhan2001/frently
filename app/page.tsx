// Landing page — Frently (MVP)
// Hero with placeholder photo area, then 6 placeholder Featured slots
// (the 6 most recent rentals will populate here once listings are live).
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  // Override the template — the homepage shouldn't append " — Frently".
  title: { absolute: "Frently — List Your Rental on MLS" },
};

import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import {
  IconArrowRight,
  IconBath,
  IconBed,
  IconMapPin,
  IconSquare,
} from "@/components/icons";
import { FEATURED_UNITS, type FeaturedUnit } from "@/constants/featured-listings";

function Hero() {
  return (
    <section className="bg-page">
      <Container className="pt-6 pb-20">
        <div className="relative rounded-3xl overflow-hidden shadow-sm">
          <div className="aspect-[16/9] md:aspect-[2.1/1] w-full bg-page">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1576337082014-9c97f681b3db?q=80&w=1170&auto=format&fit=crop"
              alt="Modern Ontario rental"
              className="w-full h-full object-cover"
              loading="eager"
            />
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
            <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
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
          {FEATURED_UNITS.map((u) => (
            <FeaturedCard key={u.id} unit={u} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function FeaturedCard({ unit }: { unit: FeaturedUnit }) {
  return (
    <article className="bg-white rounded-2xl border border-line overflow-hidden flex flex-col group hover:shadow-card transition">
      <div className="relative aspect-[4/3] overflow-hidden bg-page">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={unit.image}
          alt={unit.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/95 backdrop-blur text-[11px] font-semibold text-forest border border-forest/15">
          <span className="w-1.5 h-1.5 rounded-full bg-forest" /> For rent
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="text-[12.5px] text-muted inline-flex items-center gap-1.5">
          <IconMapPin size={13} color="#999" /> {unit.city}, {unit.province}
        </div>
        <h3 className="mt-1 text-[18px] font-semibold text-ink tracking-tight">
          {unit.title}
        </h3>
        <div className="text-[12.5px] text-muted mt-0.5 truncate">{unit.address}</div>

        <div className="mt-3 flex items-center gap-4 text-[12.5px] text-body border-t border-line pt-3">
          <span className="inline-flex items-center gap-1.5">
            <IconBed size={14} color="#666" /> {unit.beds} bed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconBath size={14} color="#666" /> {unit.baths} bath
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconSquare size={14} color="#666" /> {unit.sqft} sqft
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-[22px] font-bold text-forest tracking-tight">
              ${unit.rent.toLocaleString()}
            </span>
            <span className="text-[13px] text-muted"> /mo</span>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-forest text-white text-[12.5px] font-medium hover:bg-forest-700 transition"
          >
            View details <IconArrowRight size={13} color="#fff" />
          </Link>
        </div>
      </div>
    </article>
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
