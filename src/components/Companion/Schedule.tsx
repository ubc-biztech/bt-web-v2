interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

interface ScheduleProps {
  data: ScheduleItem[];
  date: string;
  location: string;
}

const Schedule = ({ data, date, location }: ScheduleProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Schedule</h2>
        <p className="text-gray-600">{date}</p>
        <p className="text-gray-600">{location}</p>
      </div>
      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={`${item.time}-${item.title}`}
            className="bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600 mt-1">{item.description}</p>
                )}
              </div>
              <span className="text-gray-500 whitespace-nowrap ml-4">
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
