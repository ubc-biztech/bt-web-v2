import { Inter } from "next/font/google";
import QrCheckIn from "@/components/QrScanner/QrScanner";
import { fetchRegistrationData } from "@/lib/dbUtils";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [qr, toggleQr] = useState(true);
  const [data, setData] = useState([]);
  useEffect(() => {
    let stuff;
    const fetchData = async () => {
      stuff = await fetchRegistrationData("string", "year");
    };
    fetchData();
    if (stuff) {
      setData(stuff);
    }
  }, []);
  return (
    <main className="bg-primary-color min-h-screen">
      {/* <h1>amazing biztech app</h1> */}
      <QrCheckIn
        event={{ id: "a", year: "2020" }}
        rows={data}
        visible={qr}
        setVisible={toggleQr}
      />
    </main>
  );
}
