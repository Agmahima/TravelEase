"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
// import { queryClient } from "./lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import 'leaflet/dist/leaflet.css';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head> <script async src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider client={queryClient}>
        <AuthProvider>
        {children}
        </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
