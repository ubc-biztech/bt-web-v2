interface StatsTableProps {
  data: { label: string; value: number }[];
}

const StatsTable: React.FC<StatsTableProps> = ({ data }) => {
  const renderData = (): JSX.Element[] => {
    const result: JSX.Element[] = [];
    const groupedData: { [key: string]: { label: string; value: number }[] } =
      {};

    data.forEach((item) => {
      const [parent, child] = item.label.split(":");
      if (child) {
        if (!groupedData[parent]) {
          groupedData[parent] = [];
        }
        groupedData[parent].push({ label: child, value: item.value });
      } else {
        result.push(
          <>
            <div className="col-span-2">{item.label}</div>
            <div className="col-span-1 text-right">{item.value}</div>
          </>
        );
      }
    });

    Object.entries(groupedData).forEach(([parent, children]) => {
      result.push(
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

    return result;
  };

  return (
    <div className="grid grid-cols-3 gap-2 text-pale-blue">{renderData()}</div>
  );
};

export default StatsTable;
