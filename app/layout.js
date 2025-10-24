import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Gestor de Torneos de Vóley",
  description: "Sistema de gestión de torneos de vóley playa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">
        <Navbar />
        <main className="pt-6">{children}</main>
      </body>
    </html>
  );
}
