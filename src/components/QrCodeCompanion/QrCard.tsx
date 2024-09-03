import { FC } from "react";
import { QR, QrType } from "./types";
import Image from "next/image";
import { DownloadIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const QrCard: FC<{
  qr: QR;
}> = ({ qr }) => {
  const download = (filename: string, content: string) => {
    var element = document.createElement("a");
    element.setAttribute("href", content);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const handleDownload = async (e: any) => {
    try {
      const result = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${
          process.env.REACT_APP_STAGE === "local"
            ? "http://localhost:3000"
            : `https://${process.env.REACT_APP_STAGE === "production" ? "" : "dev."}app.ubcbiztech.com`
        }/redeem/${qr["eventID;year"].split(";")[0]}/${qr["eventID;year"].split(";")[1]}/${qr.id}`,
        {
          method: "GET",
          headers: {}
        }
      );
      const blob = await result.blob();
      const url = URL.createObjectURL(blob);
      download("test", url);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <AnimatePresence mode='popLayout' key={qr.id.toLowerCase()}>
      <motion.div
        className='w-full rounded-[10px] bg-[#304068] p-5'
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        key={qr.id.toLowerCase()}
      >
        <div className='grid grid-cols-1 md:flex md:flex-row items-start content-center lg:content-normal gap-4 w-full flex-wrap xl:flex-nowrap'>
          <div className='basis-[100%] flex flex-row w-full grow justify-center lg:basis-0'>
            <div className='bg-white p-2 rounded-lg h-min w-min content-center lg:content-normal'>
              <div className='relative size-[70px] lg:size-[120px]'>
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${
                    process.env.REACT_APP_STAGE === "local"
                      ? "http://localhost:3000"
                      : `https://${process.env.REACT_APP_STAGE === "production" ? "" : "dev."}app.ubcbiztech.com`
                  }/redeem/${qr["eventID;year"].split(";")[0]}/${qr["eventID;year"].split(";")[1]}/${qr.id}`}
                  alt='QR'
                  fill
                  sizes='(max-width: 768) 100vw, (max-width: 1200px) 50vw, 33vw'
                  className='object-cover'
                />
              </div>
            </div>
          </div>
          <div className='flex flex-col grow w-full xl:justify-start'>
            <h4 className='text-white text-md text-center xl:text-start'>{qr.id}</h4>
            <div className='flex flex-row xl:block justify-center'>
              <div className='grid grid-cols-1 lg:grid-cols-2 w-max gap-1 gap-x-5'>
                <div className='text-baby-blue text-[13px]'>Event: {qr["eventID;year"]}</div>
                <div className='text-baby-blue text-[13px]'>Type: {qr.type ? qr.type : "Booth"}</div>
                <div className='text-baby-blue text-[13px]'>Points: {qr.points}</div>
                <div className='text-baby-blue text-[13px]'>Scans: {qr.isUnlimitedScans ? "Unlimited" : "One-time"}</div>
                <div className='text-baby-blue text-[13px]'>Status: {qr.isActive ? "Active" : "Inactive"}</div>
                <div className='text-baby-blue text-[13px]'>
                  {qr.type === QrType.workshop && qr.data?.workshopID ? `Workshop ID: ${qr.data.workshopID}` : ""}
                </div>
                <div className='text-baby-blue text-[13px] max-w-[150px]'>
                  {qr.type === QrType.partner && qr.data?.partnerID ? `Partner: ${qr.data.partnerID}` : ""}
                </div>
                <div className='text-baby-blue text-[13px] max-w-[100px]'>
                  {qr.type === QrType.partner && qr.data?.linkedin ? `Linkedin: ${qr.data.linkedin}` : ""}
                </div>
              </div>
            </div>
          </div>
          <div className='w-full flex flex-row justify-center xl:justify-end items-center h-min px-2'>
            <DownloadIcon width={20} height={12} className='text-biztech-green fill-current' />
            <div
              className='text-biztech-green focus:text-dark-green text-[14px]'
              onClick={(e) => {
                handleDownload(e);
              }}
            >
              Download PNG
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QrCard;
