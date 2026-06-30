import "./globals.css";

export const metadata = {
  title: "BoxFox — Design | Print | Packaging",
  description:
    "India's trusted packaging partner. Premium duplex, rigid, corrugated & bakery boxes with custom prints. Free delivery on orders over ₹2000.",
  icons: {
    icon: "/BOXFOX-1.png",
    shortcut: "/BOXFOX-1.png",
    apple: "/BOXFOX-1.png",
  },
  alternates: {
    canonical: "https://boxfox.in",
  },
};

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import SiteLoader from "./components/SiteLoader";
import ClientLayout from "./components/ClientLayout";
import WhatsAppButton from "./components/WhatsAppButton";
import AIChatBot from "./components/AIChatBot";
import InstallPWA from "./components/InstallPWA";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Space+Grotesk:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <SiteLoader />

        {/* Modern, User-Friendly Storefront */}
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
              <AIChatBot />
              <WhatsAppButton />
              <InstallPWA />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
