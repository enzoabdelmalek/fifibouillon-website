import Image from "next/image";
import { CatMark } from "@/components/logo";
import { photos, type PhotoName } from "@/lib/photos";
import { cn } from "@/lib/utils";

const RATIO_CLASS: Record<string, string> = {
  "3/4": "aspect-3/4",
  "4/3": "aspect-4/3",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
  "3/2": "aspect-3/2",
};

/**
 * Un emplacement photo du site.
 *
 * Tant que le client n'a pas fourni l'image, l'emplacement affiche un panneau
 * ornemental aux mêmes proportions : double filet or et chat en filigrane,
 * le vocabulaire graphique déjà utilisé ailleurs. Le visiteur voit un élément
 * de décor assumé, pas un trou — et le jour où la photo arrive, elle prend
 * exactement la même place, sans que rien ne bouge autour.
 *
 * En développement seulement, le panneau affiche le brief de la photo
 * attendue : c'est la liste de courses à envoyer au client.
 */
export function Photo({
  name,
  className,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  preload = false,
}: {
  name: PhotoName;
  className?: string;
  /** Largeur rendue, pour que le navigateur choisisse le bon fichier. */
  sizes?: string;
  /** À n'activer que pour une image visible sans défiler. */
  preload?: boolean;
}) {
  const photo = photos[name];
  const shape = cn(
    "relative overflow-hidden rounded-sm border border-line",
    RATIO_CLASS[photo.ratio],
    className,
  );

  if (!photo.file) {
    return <PendingPhoto name={name} className={shape} />;
  }

  return (
    <div className={shape}>
      <Image
        src={`/photos/${photo.file}`}
        alt={photo.alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover"
      />
    </div>
  );
}

/** Panneau affiché tant que la photo n'est pas fournie. */
function PendingPhoto({ name, className }: { name: PhotoName; className: string }) {
  const photo = photos[name];

  return (
    <div
      className={cn("grain bg-paper-alt shadow-card", className)}
      // Décoratif : il ne remplace pas une photo, il n'a rien à annoncer.
      role="presentation"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-sm border border-accent/35"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[18px] rounded-sm border border-accent/15"
      />
      <div className="absolute inset-0 grid place-items-center">
        <CatMark className="h-1/2 opacity-[0.12]" />
      </div>

      {process.env.NODE_ENV === "development" ? (
        <p className="absolute inset-x-6 bottom-6 text-center text-xs/relaxed text-muted">
          <span className="font-medium text-ink">{name}</span> — {photo.brief}
        </p>
      ) : null}
    </div>
  );
}
