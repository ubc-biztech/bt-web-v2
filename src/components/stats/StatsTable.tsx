import { StatsChartData } from "@/types/types";

interface StatsTableProps {
  data: StatsChartData[];
}

const buildTableRows = (data: StatsChartData[]) => {
  const rows: JSX.Element[] = [];
  const groupedData: { [key: string]: StatsChartData[] } = {};

  data.forEach((item) => {
    const [parent, child] = item.label.split(":");
    if (child) {
      if (!groupedData[parent]) {
        groupedData[parent] = [];
      }
      groupedData[parent].push({ label: child, value: item.value });
    } else {
      rows.push(
        <div key={`label-${item.label}`} className="contents">
          <div className="col-span-2">{item.label}</div>
          <div className="col-span-1 text-right">{item.value}</div>
        </div>,
      );
    }
  });

  Object.entries(groupedData).forEach(([parent, children]) => {
    rows.push(
      <div key={`group-${parent}`} className="contents">
        <div className="col-span-3 font-bold">{parent}</div>
        {children.map(({ label, value }) => (
          <div key={`${parent}-${label}`} className="contents">
            <div className="col-span-2 pl-4">{label}</div>
            <div className="col-span-1 text-right">{value}</div>
          </div>
        ))}
      </div>,
    );
  });

  return rows;
};

const StatsTable: React.FC<StatsTableProps> = ({ data }) => {
  const tableRows = buildTableRows(data);

  return (
    <>
      {data.length === 0 ? (
        <div className="flex justify-center text-white">No data available</div>
      ) : (
        <div className="grid grid-cols-3 gap-2 text-bt-blue-0">{tableRows}</div>
      )}
    </>
  );
};

export default StatsTable;
