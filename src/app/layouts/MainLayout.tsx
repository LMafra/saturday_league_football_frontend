import { PropsWithChildren } from "react";
import Navbar from "@/shared/layout/Navbar";
import Footer from "@/shared/layout/Footer";
import { typography, colors } from "@sarradahub/design-system/tokens";

const MainLayout = ({ children }: PropsWithChildren) => (
  <div
    className="flex min-h-screen flex-col"
    style={{ fontFamily: typography.fontFamily.sans, backgroundColor: colors.neutral[50] }}
  >
    <Navbar />
    <main className="mt-16 flex-1">{children}</main>
    <Footer />
  </div>
);

export default MainLayout;

