import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function PageHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-40 flex items-center px-4 pt-4 pb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back to home"
          className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </Link>
        <h1 className="text-[14px] font-bold tracking-wide text-foreground uppercase">
          {title}
        </h1>
      </div>
    </div>
  );
}
