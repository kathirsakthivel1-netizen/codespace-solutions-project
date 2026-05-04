import { useEffect, useState } from "react";
import { Download, Share, Plus, X, Smartphone } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const InstallPrompt = () => {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    setIsIOS(ios);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (standalone) setInstalled(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      if (!sessionStorage.getItem("sf-install-dismissed")) setOpen(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Show iOS hint once if on mobile Safari and not installed
    if (ios && !standalone && !sessionStorage.getItem("sf-install-dismissed")) {
      setTimeout(() => setOpen(true), 1500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !open) return null;

  const dismiss = () => {
    sessionStorage.setItem("sf-install-dismissed", "1");
    setOpen(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] w-[min(92vw,420px)] animate-fade-in safe-bottom">
      <div className="glass-strong glass-sheen rounded-3xl p-4 flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-[0_0_24px_hsl(var(--primary)/0.55)]">
          <Smartphone className="h-5 w-5 text-white" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold tracking-tight">Install SmartFridge</p>
          {isIOS ? (
            <p className="text-[11px] text-soft mt-1 leading-relaxed">
              Tap <Share className="inline h-3 w-3 mx-0.5" /> Share, then{" "}
              <span className="inline-flex items-center gap-0.5 font-medium">
                <Plus className="h-3 w-3" /> Add to Home Screen
              </span>
              .
            </p>
          ) : (
            <p className="text-[11px] text-soft mt-1">
              Add to your phone for a faster, full-screen experience.
            </p>
          )}
          {!isIOS && deferred && (
            <button
              onClick={install}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white hover:scale-[1.03] transition-transform"
            >
              <Download className="h-3.5 w-3.5" /> Install app
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0"
        >
          <X className="h-4 w-4 text-soft" />
        </button>
      </div>
    </div>
  );
};
