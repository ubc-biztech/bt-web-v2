import EventCard from "@/components/EventCard/event-card"
import MobileEventCard from "@/components/EventCard/mobile-event-card"
import { useRouter } from 'next/router'
import { useEffect, useState } from "react";
import { isMobile } from "@/util/isMobile";

import GridViewIcon from "../../../public/assets/icons/grid_view_icon.svg"
import CompactViewIcon from "../../../public/assets/icons/compact_view_icon.svg"
import { Button } from "@/components/ui/button"
import Image from 'next/image';
// this is placeholder if no event image is found
import placeHolderImage from '../../assets/event-placeholder.jpeg';

type Props = {
    // TODO: GRAB DATA FROM BACKEND - THE BELOW IS USED FOR TESTING PURPOSES
    initialData: BiztechEvent[] | null
}

// type definition for a BiztechEvent
type BiztechEvent = {
    id: string;
    year: number;
    capac: number;
    createdAt: number;
    description: string;
    elocation: string;
    ename: string;
    startDate: string;
    endDate: string;
    imageUrl: string;
    updatedAt: number;
  };

export default function AdminEventView({ initialData }: Props) {
    const router = useRouter() 
    const [isLoading, setLoading] = useState(!initialData)
    const [data, setData] = useState< BiztechEvent[] | null >(initialData);
    // add a mobile state and change grid to block if mobile view
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        setIsMobileDevice(isMobile(userAgent));
    }, []);
    // 
    useEffect(() => {
        if (!initialData && router.isReady) {
            fetchEventData().then(d => {
                setData(d)
                setLoading(false)
            })
        }
    }, [router.isReady, initialData]);

    // ** had to comment this line out or else get a 'hydration' error
    // if (!router.isReady) return null;


    return (
        <main className="bg-primary-color min-h-screen">
            <div className="mx-auto pt-20 pl-20 pr-20 flex flex-col">
                <span>
                    {!isMobileDevice? (
                        <h2 className="text-white">Admin Event Portal</h2>
                    ) :
                        <h3 className="text-white">Admin Event Portal</h3>
                    }
                    <div className="flex items-center justify-between">
                        <p className="text-baby-blue font-poppins">Manage published Biztech events.</p>
                        {!isMobileDevice? ( 
                            <div>
                                <Button variant="ghost" className='bg-transparent'>
                                    <Image src={GridViewIcon} alt="Grid View Icon"/>
                                </Button>
                                <Button variant="ghost" className='bg-transparent'>
                                    <Image src={CompactViewIcon} alt="Compact View Icon"/>
                                </Button>
                            </div>
                        ) : (<div></div>)
                        }
                    </div>
                </span>
                {/*divider*/}
                <div className="w-full h-[2px] bg-login-form-card my-6" />
                {/* conditionally mapping the events gathered from the database to the screen  */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-white">Loading...</p>
                    </div>
                ) : !data ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-white">Event not found</p>
                    </div>
                ) : (!isMobileDevice?
                    <div className="block md:grid md:grid-cols-2 md:gap-6">
                        {data.map(event => (
                            <EventCard key={event.id} initialData={event} />
                        ))}
                    </div> :
                    <div className="block md:grid md:grid-cols-2 md:gap-6">
                    {data.map(event => (
                        <MobileEventCard key={event.id} initialData={event} />
                    ))}
                </div>
                )}
            </div>
        </main>
    );
}


async function fetchEventData() {
    // TODO - fetch data from backend. This is just returning a Mock, likely won't be the final data struct format

    let data = []
    for (let i = 0; i < 10; i++) {
        data.push({
            id: "existingEvent1",
            year: 2020,
            capac: 123,
            createdAt: 1581227718674,
            description:	"I am a description",
            elocation: "UBC",   
            ename: "cool event",   
            startDate: "2024-07-01T07:00:11.131Z",
            endDate:	"2024-07-01T21:00:11.131Z",
            imageUrl:	"https://i.picsum.photos/id/236/700/400.jpg",
            updatedAt: 1581227718674
        })
    }

    return data
}