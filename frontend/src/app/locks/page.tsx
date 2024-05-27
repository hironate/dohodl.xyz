import Locks from "@/components/Locks";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { DefaultMetadata } from "@/utils/constant";

export const metadata = DefaultMetadata;

const LocksPage = () => {
  return (
    <DefaultLayout>
      <Locks />
    </DefaultLayout>
  );
};

export default LocksPage;
