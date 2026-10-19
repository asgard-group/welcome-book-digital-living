import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Anchor-like component for links that leave the welcome book (mailto, tel,
 * WhatsApp, Google Maps, external sites, ...). Confirms with the guest
 * before navigating away instead of opening the link directly.
 */
export function ExternalLink({
  href,
  newTab,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  href: string;
  newTab?: boolean;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const isMailto = href.startsWith("mailto:");
  const emailAddress = isMailto ? href.slice("mailto:".length).split("?")[0] : null;

  const copyEmail = () => {
    if (!emailAddress) return;
    navigator.clipboard?.writeText(emailAddress).then(() => {
      toast.success(t.common.emailCopiedToast);
    }).catch(() => {});
  };

  const confirmLeave = () => {
    if (newTab) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = href;
    }
  };

  return (
    <>
      <a
        href={href}
        aria-label={ariaLabel}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </a>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="w-[calc(100%-60px)] rounded-[0.75rem]">
          {isMailto && emailAddress ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.common.emailChooseTitle}</AlertDialogTitle>
                <AlertDialogDescription>{t.common.emailChooseDesc}</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-2">
                <AlertDialogAction
                  onClick={() =>
                    window.open(
                      `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(emailAddress)}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  {t.common.emailOpenOutlook}
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={() =>
                    window.open(
                      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  {t.common.emailOpenGmail}
                </AlertDialogAction>
                <AlertDialogAction onClick={copyEmail}>{t.common.emailCopy}</AlertDialogAction>
                <AlertDialogCancel className="hover:bg-muted hover:text-foreground">
                  {t.common.leaveAppCancel}
                </AlertDialogCancel>
              </div>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.common.leaveAppTitle}</AlertDialogTitle>
                <AlertDialogDescription>{t.common.leaveAppDesc}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-muted hover:text-foreground">
                  {t.common.leaveAppCancel}
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmLeave}>{t.common.leaveAppContinue}</AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
