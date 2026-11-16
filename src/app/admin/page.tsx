import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/admin-app";

export const metadata: Metadata = {
  title: "Admin Portal | Nandhini Tex",
  description: "Nandhini Tex Store Administration Panel",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminApp standalone />;
}
