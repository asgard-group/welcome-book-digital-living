import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Star, Heart } from "lucide-react";
import { toast } from "sonner";
import heroImg from "@/assets/hero-living-room.png";
import joroLogo from "@/assets/joro-living-logo.png";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SettingsPopover } from "@/components/SettingsPopover";

export default function Thanks() {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }
    toast.success("Merci pour votre avis !");
    setRating(0);
    setMessage("");
  };

  return (
    <div className="min-h-screen w-full bg-muted/30">
      <div className="mx-auto w-full max-w-[760px] min-h-screen relative overflow-hidden shadow-sm">
        {/* Background image */}
        <img
          src={heroImg}
          alt="Jöro Living"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen pb-6">
          {/* Back arrow */}
          <div className="px-4 pt-4 flex items-center justify-between">
            <Link
              to="/home"
              aria-label="Retour"
              className="h-11 w-11 flex items-center justify-center"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </Link>
            <SettingsPopover variant="light" />
          </div>

          {/* Title / subtitle */}
          <div className="text-center px-4 mt-1 mb-5">
            <h1 className="font-serif font-medium text-white text-[44px] leading-none tracking-tight uppercase">
              Merci beaucoup
            </h1>
            <p className="mt-2 text-white/95 text-[17px] font-medium">
              Votre retour compte beaucoup pour nous
            </p>
          </div>

          {/* Review card */}
          <div className="flex-1 flex flex-col justify-center px-[30px]">
            <div className="rounded-3xl p-6 backdrop-blur-md bg-white/75 dark:bg-[#1c2626]/80">
              <div className="flex flex-col items-center text-center mb-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#1c2626]/40 dark:bg-[#323E3E] dark:border-transparent mb-4">
                  <Heart
                    className="h-[30px] w-[30px] text-[#1c2626] dark:text-white"
                    strokeWidth={1.5}
                  />
                </span>
                <h2 className="text-[18px] font-semibold uppercase tracking-wide text-[#1c2626] dark:text-white">
                  Partagez votre expérience
                </h2>
                <p className="text-[13px] text-[#1c2626]/70 dark:text-white/80 mt-1 max-w-[260px]">
                  Votre avis nous aide à améliorer chaque séjour chez Jöro Living.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Star rating */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[13px] font-medium text-[#1c2626]/80 dark:text-white/80">
                    Notez votre séjour
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= (hoverRating || rating)
                              ? "fill-[#1c2626] text-[#1c2626] dark:fill-white dark:text-white"
                              : "text-[#1c2626]/30 dark:text-white/30"
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-[13px] font-medium text-[#1c2626]/80 dark:text-white/80"
                  >
                    Votre message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Racontez-nous votre séjour..."
                    className="min-h-[120px] rounded-xl border-[#1c2626]/20 bg-white/60 text-[#1c2626] placeholder:text-[#1c2626]/40 dark:bg-[#323E3E]/60 dark:text-white dark:placeholder:text-white/50 dark:border-transparent resize-none"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#1c2626] text-white hover:bg-[#1c2626]/90 text-[15px] font-semibold uppercase tracking-wide"
                >
                  Envoyer mon avis
                </Button>

                {/* Contact link */}
                <a
                  href="mailto:reservation@joro-space.fr"
                  className="block text-center text-[13px] font-medium text-[#1c2626]/70 dark:text-white/70 hover:text-[#1c2626] dark:hover:text-white transition-colors"
                >
                  Me contacter directement
                </a>
              </form>
            </div>
          </div>

          {/* Footer logo */}
          <div className="flex justify-center pt-2">
            <img
              src={joroLogo}
              alt="Jöro Living"
              className="w-[160px] h-auto object-contain brightness-0 invert"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
