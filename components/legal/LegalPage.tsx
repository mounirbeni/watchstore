import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  subtitle?: string;
  updatedAt: string;
  sections: LegalSection[];
}

export default function LegalPage({ title, subtitle, updatedAt, sections }: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-luxury-muted hover:text-luxury-white transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> Retour à l&apos;accueil
      </Link>

      <header className="mb-8 sm:mb-10 pb-8 border-b border-luxury-border">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-2">
          Informations légales
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-luxury-white">{title}</h1>
        {subtitle && <p className="mt-3 text-sm sm:text-base text-luxury-muted leading-relaxed">{subtitle}</p>}
        <p className="mt-4 text-xs text-luxury-muted">Dernière mise à jour : {updatedAt}</p>
      </header>

      <div className="space-y-8">
        {sections.map((section, i) => (
          <section key={section.heading}>
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-luxury-white mb-3">
              <span className="text-gold-500">{String(i + 1).padStart(2, "0")}.</span> {section.heading}
            </h2>
            <div className="text-sm sm:text-[15px] text-luxury-light leading-relaxed space-y-3">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
