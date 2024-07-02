const dietaryRestrictions = {
  None: 200,
  Vegetarian: 20,
  Vegan: 4,
  Halal: 8,
  Pescetarian: 4,
};

interface StatsTableProps {
  title?: string;
  data?: Object;
}

const StatsTable: React.FC<StatsTableProps> = ({
  title = "Dietary Restrictions",
  data = dietaryRestrictions,
}) => {
  return (
    <div className="bg-dark-slate p-8 w-1/3 rounded-md">
      <h5 className="text-white">{title}</h5>
      <br />
      <div className="grid grid-cols-2 gap-2 text-pale-blue">
        {Object.entries(data).map(
          ([restriction, count], index) => (
            <>
              <div className="col-span-1">{restriction}</div>
              <div className="col-span-1 text-right">{count}</div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default StatsTable;
