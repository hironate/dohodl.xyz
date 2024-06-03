import Dashboard from "@/components/Dashboard";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { DefaultMetadata } from "@/utils/constant";
import Analytics from "@/components/analytics";

export const metadata = DefaultMetadata;

export default function Home() {
  return (
    <>
      <Analytics />
    </>
  );
}
