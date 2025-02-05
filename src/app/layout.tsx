import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/context";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Bounce, ToastContainer } from 'react-toastify';
import "./globals.css";
import QueryClientContextProvider from './QueryClientContextProvider';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      >
        <QueryClientContextProvider>
          <AuthProvider>
            <Navbar/>
            {children}
            <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Bounce}
            />
          </AuthProvider>
        </QueryClientContextProvider>
      </body>
    </html>
  );
}
