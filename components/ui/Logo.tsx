import { APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

/** Official AnalytIQ icon mark (purple A + ascending bars). Theme-agnostic. */
export const LOGO_MARK_SRC = "/branding/analytiq-mark.png";
/** Full AnalytIQ logo (mark + wordmark). Light wordmark — use on dark surfaces. */
export const LOGO_FULL_SRC = "/branding/analytiq-logo.png";

export function LogoMark({ className, alt = APP_NAME }: { className?: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_MARK_SRC}
      alt={alt}
      className={cn("h-8 w-8 object-contain", className)}
      draggable={false}
    />
  );
}

export function Logo({
  className,
  markClassName,
  showName = true,
}: {
  className?: string;
  markClassName?: string;
  showName?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {/* decorative when the wordmark text is shown alongside */}
      <LogoMark className={cn("h-8 w-8", markClassName)} alt={showName ? "" : APP_NAME} />
      {showName && (
        <span className="text-lg font-bold tracking-tight text-ink-900">{APP_NAME}</span>
      )}
    </span>
  );
}
