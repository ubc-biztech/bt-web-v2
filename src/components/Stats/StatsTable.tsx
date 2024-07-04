interface StatsTableProps {
  title: string;
  data: Object;
}

const StatsTable: React.FC<StatsTableProps> = ({ title, data }) => {
  const renderData = (data: Object, marginValue: number = 0): JSX.Element[] => {
    return Object.entries(data).map(([restriction, count]) => {
      if (typeof count === "number" || typeof count === "string") {
        return (
          <>
            <div
              className="col-span-2"
              style={{ marginLeft: `${marginValue}px` }}
            >
              {restriction}
            </div>
            <div className="col-span-1 text-right">{count}</div>
          </>
        );
      } else {
        return (
          <>
            <div
              className="col-span-2"
              style={{ marginLeft: `${marginValue}px` }}
            >
              {restriction}
            </div>
            {renderData(count, marginValue + 16)}
          </>
        );
      }
    });
  };
  return (
    <div className="bg-dark-slate p-8 w-1/3 rounded-md">
      <h5 className="text-white">{title}</h5>
      <br />
      <div className="grid grid-cols-3 gap-2 text-pale-blue">
        {renderData(data)}
      </div>
    </div>
  );
};

export default StatsTable;
