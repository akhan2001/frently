// Site footer — identical on every public page.
import { Container } from "@/components/Container";
import { Wordmark } from "@/components/Wordmark";

export function Footer() {
  return (
    <footer className="bg-white border-t border-line">
      <Container>
        <div className="py-8 flex items-center justify-between gap-4">
          <span className="text-forest text-[20px]"><Wordmark /></span>
          <span className="text-[12px] text-muted">
            © 2026 · Operated by Vancor Realty · Brokerage{" "}
            <span className="font-mono">#CAS984</span>
          </span>
        </div>
      </Container>
    </footer>
  );
}
