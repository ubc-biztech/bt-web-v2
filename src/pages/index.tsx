import { Inter } from "next/font/google";
import PieChart from '@/components/stats/PieChart';

const inter = Inter({ subsets: ["latin"] });

const data = [
  { label: 'Instagram', value: 10 },
  { label: 'Word of Mouth', value: 45 },
  { label: 'Tech Newsletter', value: 1 },
  { label: 'LinkedIn', value: 3 },
  { label: 'Facebook', value: 6 },
  { label: 'Boothing', value: 5 },
  { label: 'Other', value: 30 },
];

export default function Home() {
  return (
    <main className="bg-primary-color min-h-screen">
      {/* <h1>amazing biztech app</h1> */}
    </main>
  );
}
