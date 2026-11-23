import { MobileNav } from "@/components/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="app-shell">{children}</div>
      <MobileNav />
    </>
  );
}
