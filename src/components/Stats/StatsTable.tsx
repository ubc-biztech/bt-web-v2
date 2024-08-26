import { StatsChartData } from "@/types/types";

interface StatsTableProps {
  data: StatsChartData[];
}

const StatsTable: React.FC<StatsTableProps> = ({ data }) => {
  const renderData = () => {
    const simpleData: JSX.Element[] = [];
    const groupedData: { [key: string]: StatsChartData[] } =
      {};

    data.forEach((item) => {
      const [parent, child] = item.label.split(":");
      if (child) {
        if (!groupedData[parent]) {
          groupedData[parent] = [];
        }
        groupedData[parent].push({ label: child, value: item.value });
      } else {
        simpleData.push(
          <>
            <div className="col-span-2">{item.label}</div>
            <div className="col-span-1 text-right">{item.value}</div>
          </>
        );
      }
    });

    Object.entries(groupedData).forEach(([parent, children]) => {
      simpleData.push(
        <>
          <div className="col-span-3 font-bold">{parent}</div>
          {children.map(({ label, value }) => (
            <>
              <div className="col-span-2 pl-4">{label}</div>
              <div className="col-span-1 text-right">{value}</div>
            </>
          ))}
        </>
      );
    });

    return simpleData;
  };

  return (
    <>
      {data.length === 0 ? (
        <div className="flex justify-center text-white">No data available</div>
      ) : (
        <div className="grid grid-cols-3 gap-2 text-pale-blue">
          {renderData()}
        </div>
      )}
    </>
  );
};

export default StatsTable;
