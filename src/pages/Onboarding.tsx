import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero-living-room.png";
import logo from "@/assets/joro-living-logo.png";

export default function Onboarding() {
  const navigate = useNavigate();

  const handleStart = () => {
    try {
      localStorage.setItem("joro_onboarded", "1");
    } catch {}
    navigate("/home");
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <img
        src={heroImg}
        alt="Intérieur du logement"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute bottom-0 left-0 right-0 z-0"
        style={{
          height: "558px",
          background:
            "linear-gradient(179deg, rgba(28, 38, 38, 0.00) 23.22%, rgba(28, 38, 38, 0.86) 65.12%, #1C2626 88.48%)",
        }}
      />

      <div className="relative z-10 flex h-full w-full max-w-[760px] mx-auto flex-col">
        {/* Logo */}
        <div className="flex justify-center pt-[22%]">
          <img src={logo} alt="Joro Living" className="w-[88%] max-w-[420px]" />
        </div>

        {/* Bottom content */}
        <div className="mt-auto px-6 pb-10 flex flex-col items-center text-center">
          <p className="text-white text-[17px] font-medium leading-snug max-w-[320px]">
            Nous sommes ravis de vous accueillir.
            <br />
            Profitez bien de votre séjour !
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="mt-8 w-full max-w-[260px] flex items-center justify-center gap-[7px] rounded-full bg-[#2E3F3E] px-7 py-4 text-white transition-colors hover:bg-[#3a4f4e]"
          >
            <span className="text-center text-[16px] font-semibold whitespace-nowrap">
              Commencer mon séjour
            </span>
            <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
