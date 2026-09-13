import Link from "next/link";
import { CatMark } from "@/components/logo";

export default function NotFound() {
  return (
    <section className="grain relative flex min-h-[80svh] items-center overflow-hidden bg-[#6b0b0c] pt-[72px] text-[#fff8ca]">
      <div className="relative mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <CatMark className="mx-auto h-28 opacity-90" />
        <p className="eyebrow mt-10 text-[#c8920e]">Erreur 404</p>
        <h1 className="mt-5 font-display text-4xl/[1.08] tracking-tight text-balance sm:text-5xl/[1.06]">
          Cette page a filé comme un chat.
        </h1>
        <p className="mt-6 text-base/relaxed text-[#fff8ca]/70">
          La page que vous cherchez n’existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-[#fff8ca] px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-[#2d120d] uppercase transition-transform duration-200 hover:-translate-y-0.5"
        >
          Retour à l’accueil
        </Link>
      </div>
    </section>
  );
}
