import PieChart from "@/components/stats/PieChart";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const dummyData = [
  { label: 'Category A', value: 30 },
  { label: 'Category B', value: 20 },
  { label: 'Category C', value: 15 },
  { label: 'Category D', value: 25 },
  { label: 'Category E', value: 10 },
];

export default function Home() {
  return (
    <main className="bg-primary-color min-h-screen">
      <h1>amazing biztech app</h1>
      <PieChart data={dummyData} />
    </main>
  );
}
