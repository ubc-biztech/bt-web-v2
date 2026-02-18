import {
  ChangeEvent,
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SearchBar } from "./SearchBar";

import { QR, QrType } from "./types";
import DropDownTab from "./DropDown";
import { fetchBackend } from "@/lib/db";
import QrCard from "./QrCard";

interface QrDashboardProps {
  qrs: QR[];
  setQRs: Dispatch<SetStateAction<QR[]>>;
}

export const QrDashboard: FC<QrDashboardProps> = ({ qrs, setQRs }) => {
  const [renderedQRs, setRenderedQRs] = useState<QR[]>(() => qrs.slice(0, 5));
  const [viewMore, setViewMore] = useState(() => qrs.length > 4);
  const [searchField, setSearchField] = useState("");
  const [qrTypeFilter, setQrTypeFilter] = useState(QrType.any);
  const [yearFilter, setYearFilter] = useState(QrType.any);

  const fetchData = async () => {
    const data = await fetchBackend({ endpoint: "/qr", method: "GET" });
    setQRs(data);
  };

  useEffect(() => {
    try {
      fetchData();
    } catch (error) {
      console.error(error);
    }
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
        return (
          qr["eventID;year"].substring(
            qr["eventID;year"].indexOf(";") + 1,
            qr["eventID;year"].length,
          ) == yearFilter
        );
      });
    }

    if (searchField !== "") {
      filteredQRs = filteredQRs.filter((qr) => {
        return qr["eventID;year"].startsWith(searchField);
      });
    }

    setRenderedQRs(filteredQRs.slice(0, 5));
    setViewMore(filteredQRs.length < 4);
    return filteredQRs;
  };

  const filteredQRs = useMemo(
    () => filterQrs(),
    [searchField, yearFilter, qrTypeFilter, qrs],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchField(e.target.value);
  };

  return (
    <div className="w-full">
      <div className="flex flex-row lg:space-x-2 items-center flex-wrap">
        <SearchBar handleChange={handleChange} searchField={searchField} />
        <div className="flex flex-row space-x-2 w-full lg:w-auto mt-2 lg:mt-0">
          <DropDownTab
            value={qrTypeFilter}
            nullVal={QrType.any}
            placeholder="[By Type]"
            valueChange={setQrTypeFilter}
            options={[
              QrType.any,
              QrType.booth,
              QrType.partner,
              QrType.workshop,
            ]}
          />
          <DropDownTab
            value={yearFilter}
            nullVal={QrType.any}
            placeholder="[By Year]"
            valueChange={setYearFilter}
            options={[
              QrType.any,
              ...Array(new Date().getFullYear() - 2000 + 1)
                .fill(null)
                .map((v, i) => {
                  return new Date().getFullYear() - i;
                }),
            ]}
          />
        </div>
      </div>
      <div className="space-y-4 my-4">
        {renderedQRs.map((qr) => (
          <div key={qr.id}>
            <QrCard qr={qr} />
          </div>
        ))}
      </div>
      {!viewMore && (
        <button
          type="button"
          className="text-lg flex flex-row items-center justify-center text-bt-blue-100 my-12 cursor-pointer"
          onClick={() => {
            setRenderedQRs(filteredQRs);
          }}
        >
          Load More
        </button>
      )}
    </div>
  );
};
