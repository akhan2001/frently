// Listings page — MVP shell. Grid of placeholder cards; populated from the
// DB once landlords start publishing through Frently.
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { ListingCardPlaceholder } from "@/components/ListingCard";
import { Nav } from "@/components/Nav";
import { IconChevronDown, IconSearch } from "@/components/icons";

function ListingsToolbar({ city }: { city: string }) {
  return (
    <div className="border-b border-line bg-white">
      <Container className="py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[13px] text-muted">Rentals</div>
          <div className="text-[20px] font-bold text-ink tracking-tight mt-0.5">{city}</div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-line rounded-full h-10 px-2">
          <div className="px-2 flex items-center text-muted">
            <IconSearch size={15} color="#999" />
          </div>
          <input
            placeholder="Search by city, neighbourhood, or address"
            className="w-[280px] bg-transparent outline-none text-[13px] placeholder:text-muted"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 text-[13px] text-body border border-line rounded-full hover:border-muted">
          Sort: <span className="text-ink font-medium">Newest</span>{" "}
          <IconChevronDown size={13} color="#999" />
        </button>
      </Container>
    </div>
  );
}

export default function ListingsPage() {
  const city = "Toronto, ON";

  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Nav />
      <ListingsToolbar city={city} />
      <main className="flex-1">
        <Container className="py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardPlaceholder key={i} />
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
