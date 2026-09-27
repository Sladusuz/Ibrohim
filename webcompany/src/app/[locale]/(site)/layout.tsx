import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CustomCursor } from "@/components/site/custom-cursor";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
