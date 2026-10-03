import type { Metadata } from "next";
import "./globals.css";
import { DatasetProvider } from "@/hooks/useDatasetContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { GlobalApiLoader } from "@/components/loading/GlobalApiLoader";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/branding";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  icons: {
    icon: [{ url: "/branding/favicon.png", type: "image/png" }],
    apple: [{ url: "/branding/favicon.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Apply the stored theme before first paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <DatasetProvider>{children}</DatasetProvider>
            </AuthProvider>
          </ToastProvider>
          <GlobalApiLoader />
        </ThemeProvider>
      </body>
    </html>
  );
}
