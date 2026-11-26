import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Photo } from "@/property/types";

/** Photo d'une réponse (FAQ, guide) avec sa légende ; un appui l'affiche en grand. */
export function PhotoFigure({ photo, lang, className = "" }: { photo: Photo; lang: "fr" | "en"; className?: string }) {
  const [zoom, setZoom] = useState(false);
  const caption = (photo.caption?.[lang] || photo.caption?.fr || "").trim();

  return (
    <figure className={className}>
      <button type="button" onClick={() => setZoom(true)} className="block w-full" aria-label={caption || undefined}>
        <img src={photo.url} alt={caption} loading="lazy" className="w-full max-h-[55vh] rounded-lg object-cover" />
      </button>
      {caption && <figcaption className="mt-1.5 text-center text-xs text-brand-ink/60 dark:text-white/60">{caption}</figcaption>}

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border-0 bg-brand-surface p-3 text-brand-ink dark:bg-brand-ink dark:text-white">
          <DialogTitle className="sr-only">{caption || "Photo"}</DialogTitle>
          <DialogDescription className="sr-only">{caption || "Photo"}</DialogDescription>
          <img src={photo.url} alt={caption} className="w-full rounded-lg object-contain" />
          {caption && <p className="text-center text-sm text-brand-ink/70 dark:text-white/70">{caption}</p>}
        </DialogContent>
      </Dialog>
    </figure>
  );
}
