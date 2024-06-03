import Locks from "@/components/Locks";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { DefaultMetadata } from "@/utils/constant";

export const metadata = DefaultMetadata;

const LocksPage = () => {
  return <Locks />;
};

export default LocksPage;
