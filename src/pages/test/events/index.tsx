import { fetchBackend } from "@/lib/db";
import { BiztechEvent } from "@/types";
import { toDate } from "date-fns";
import { GetServerSideProps } from "next";


const fetchAllEvents = async () => {
  const events = await fetchBackend({
    endpoint: `/events`,
    method: "GET",
    authenticatedCall: false,
  });

  const allEvents = events.filter(
    (event: BiztechEvent) =>
      toDate(event.startDate) > toDate(new Date(2024, 9, 1)),
  );

  return allEvents;
};

interface EventsPageProps {
  events: BiztechEvent[];
  error?: string;
}

export default function EventsPage({ events, error }: EventsPageProps) {
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Events</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Upcoming Events</h1>
      
      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No upcoming events found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {event.imageUrl && (
                <img 
                  src={event.imageUrl} 
                  alt={event.ename}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.ename}
                </h2>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>
                    <strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}
                    {event.endDate && event.startDate !== event.endDate && (
                      <> - {new Date(event.endDate).toLocaleDateString()}</>
                    )}
                  </div>
                  
                  {event.elocation && (
                    <div>
                      <strong>Location:</strong> {event.elocation}
                    </div>
                  )}
                  
                  <div>
                    <strong>Capacity:</strong> {event.capac}
                  </div>
                  
                  {event.deadline && (
                    <div>
                      <strong>Registration Deadline:</strong> {new Date(event.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {event.isPublished && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Published
                      </span>
                    )}
                    
                    {event.isApplicationBased && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Application Based
                      </span>
                    )}
                    
                    {event.isCompleted && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  
                  {event.facebookUrl && (
                    <a 
                      href={event.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Facebook Event
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center text-gray-500">
        <p>Showing {events.length} events</p>
        <p className="text-sm">Events filtered to show only those after October 1, 2024</p>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<EventsPageProps> = async (context) => {
  try {
    // Call your fetchAllEvents function
    const events = await fetchAllEvents();
    
    return {
      props: {
        events,
      },
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    
    return {
      props: {
        events: [],
        error: 'Failed to load events. Please try again later.',
      },
    };
  }
};