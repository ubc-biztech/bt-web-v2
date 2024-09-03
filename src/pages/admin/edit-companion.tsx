import { CompanionForm } from "@/components/QrCodeCompanion/Form";
import { QrDashboard } from "@/components/QrCodeCompanion/QrDashboard";
import { QR } from "@/components/QrCodeCompanion/types";
import { FC, useState } from "react";

const Page: FC = () => {
  const [qrs, setQRs] = useState<QR[]>([]);
  return (
    <main className='bg-primary-color min-h-screen w-full'>
      <div className='w-full'>
        <div className='mx-auto pt-8 md:px-20 px-5 flex flex-col'>
          <span>
            <h2 className='text-white text-xl lg:text-[40px]'>QR Code Management</h2>
            <div className='flex items-center justify-between h-[40px]'>
              <p className='text-baby-blue font-poppins'>Edit QR Codes for our events</p>
            </div>
          </span>
          <div className='bg-navbar-tab-hover-bg h-[1px] my-4' />
          <h4 className='text-baby-blue mb-4'>Create New Qr</h4>
          <CompanionForm setQRs={setQRs} />
          <div className='bg-navbar-tab-hover-bg h-[1px] my-4' />
          <h4 className='text-baby-blue mb-4'>Existing Qr Codes</h4>
          <QrDashboard qrs={qrs} setQRs={setQRs} />
        </div>
      </div>
    </main>
  );
};

export default Page;
