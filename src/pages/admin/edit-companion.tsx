import { Form } from "@/components/QrCodeManager/Form";
import { QrDashboard } from "@/components/QrCodeManager/QrDashboard";
import { FC } from "react";

interface CompanionProps {}

const Page: FC<CompanionProps> = () => {
  return (
    <main className="bg-primary-color min-h-screen w-full">
      <div className="w-full">
        <div className="mx-auto pt-8 md:px-20 px-5 flex flex-col">
          <span>
            <h2 className="text-white text-xl lg:text-[40px]">QR Code Management</h2>
            <div className="flex items-center justify-between h-[40px]">
              <p className="text-baby-blue font-poppins">Edit QR Codes for our events</p>
            </div>
          </span>
          <div className="bg-navbar-tab-hover-bg h-[1px] my-4" />
          <Form />
          <QrDashboard />
        </div>
      </div>
    </main>
  );
};

export default Page;
