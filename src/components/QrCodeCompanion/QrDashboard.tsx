import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { SearchBar } from "./SearchBar";

import { QR, QrType } from "./types";
import DropDownTab from "./DropDown";
import { fetchBackend } from "@/lib/db";
import Image from "next/image";
import QrCard from "./QrCard";
import { AnimatePresence } from "framer-motion";

interface QrDashboardProps {}

export const QrDashboard: FC<QrDashboardProps> = () => {
  const [qrs, setQRs] = useState<QR[]>([]);
  const [searchField, setSearchField] = useState("");
  const [qrTypeFilter, setQrTypeFilter] = useState(QrType.any);
  const [yearFilter, setYearFilter] = useState(QrType.any);

  const fetchData = async () => {
    const data = await fetchBackend({ endpoint: "/qr", method: "GET" });
    console.log(data);
    setQRs(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterQrs = () => {
    let filteredQRs: QR[] = qrs;
    if (qrTypeFilter === QrType.booth) {
      filteredQRs = filteredQRs.filter((qr) => {
        return !qr.type || qr.type === QrType.booth;
      });
    } else if (qrTypeFilter === QrType.partner) {
      filteredQRs = filteredQRs.filter((qr) => {
        return qr.type && qr.type === QrType.partner;
      });
    } else if (qrTypeFilter === QrType.workshop) {
      filteredQRs = filteredQRs.filter((qr) => {
        return qr.type && qr.type === QrType.workshop;
      });
    }

    if (yearFilter !== QrType.any) {
      filteredQRs = filteredQRs.filter((qr) => {
        return qr["eventID;year"].substring(qr["eventID;year"].indexOf(";") + 1, qr["eventID;year"].length) == yearFilter;
      });
    }

    if (searchField !== "") {
      filteredQRs = filteredQRs.filter((qr) => {
        return qr["eventID;year"].startsWith(searchField);
      });
    }

    return filteredQRs;
  };

  const filteredQRs = useMemo(() => filterQrs(), [searchField, yearFilter, qrTypeFilter, qrs]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchField(e.target.value);
  };

  return (
    <div className='w-full'>
      <div className='flex flex-row lg:space-x-2 items-center flex-wrap'>
        <SearchBar handleChange={handleChange} searchField={searchField} />
        <div className='flex flex-row space-x-2 w-full lg:w-auto mt-2 lg:mt-0'>
          <DropDownTab
            value={qrTypeFilter}
            nullVal={QrType.any}
            placeholder='[By Type]'
            valueChange={setQrTypeFilter}
            options={[QrType.any, QrType.booth, QrType.partner, QrType.workshop]}
          />
          <DropDownTab
            value={yearFilter}
            nullVal={QrType.any}
            placeholder='[By Year]'
            valueChange={setYearFilter}
            options={[
              QrType.any,
              ...Array(new Date().getFullYear() - 2000 + 1)
                .fill(null)
                .map((v, i) => {
                  return new Date().getFullYear() - i;
                })
            ]}
          />
        </div>
      </div>
      <div className='space-y-4 mt-4'>
        {filteredQRs.map((qr) => (
          <QrCard qr={qr} />
        ))}
      </div>
    </div>
  );
};
