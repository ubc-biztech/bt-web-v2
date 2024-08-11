import EventCard from "@/components/EventCard/eventCard"
import MobileEventCard from "@/components/EventCard/mobileEventCard"
import { useRouter } from 'next/router'
import { useEffect, useState } from "react";
import { isMobile } from "@/util/isMobile";
import MobilePopup from "@/components/EventCard/popup/mobileEditPopUp";
import { BiztechEvent } from "@/types/biztechEvent";
import GridViewIcon from "../../../public/assets/icons/grid_view_icon.svg"
import CompactViewIcon from "../../../public/assets/icons/compact_view_icon.svg"
import { Button } from "@/components/ui/button"
import Image from 'next/image';

type Props = {
    // TODO: GRAB DATA FROM BACKEND - THE BELOW IS USED FOR TESTING PURPOSES
    initialData: BiztechEvent[] | null
}

export default function AdminEventView({ initialData }: Props) {
    const router = useRouter()
    const [isLoading, setLoading] = useState(!initialData)
    const [data, setData] = useState<BiztechEvent[] | null>(initialData)
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [isClicked, setIsClicked] = useState(false)
    const [isDelete, setIsDelete] = useState(false)
    const [bizEvent, setBizEvent] = useState<BiztechEvent | null>(null)


    // toggle the view when the 'more' icon is clicked 
    const eventClick = (event: BiztechEvent) => {
        if (event) {
            setBizEvent(event) // allows us to grab the specific event which was clicked
        }
        setIsClicked(!isClicked)
    };

    // function to manage mobile device state
    useEffect(() => {
        const userAgent = navigator.userAgent
        setIsMobileDevice(isMobile(userAgent))
        if (!initialData) {
            fetchEventData().then(d => {
                setData(d)
                setLoading(false)
            })
        }
    }, [initialData]);

    // ** had to comment this line out or else get a 'hydration' error
    // if (!router.isReady) return null;

    return (
        <main className="bg-primary-color min-h-screen" onClick={() => {if (isClicked) {setIsClicked(false);}}}>
            <div className="mx-auto pt-8 p-5 md:pt-20 md:l-20 md:pr-20  flex flex-col">
                {/* Header Code and displaying view icons depending on device */}
                <span>
                    {!isMobileDevice ? (
                        <h2 className="text-white">Admin Event Portal</h2>
                    ) :
                        <h3 className="text-white">Admin Event Portal</h3>
                    }
                    <div className="flex items-center justify-between">
                        <p className="text-baby-blue font-poppins">Manage published Biztech events.</p>
                        {!isMobileDevice ? (
                            <div>
                                <Button variant="ghost" className='bg-transparent'>
                                    <Image src={GridViewIcon} alt="Grid View Icon" />
                                </Button>
                                <Button variant="ghost" className='bg-transparent'>
                                    <Image src={CompactViewIcon} alt="Compact View Icon" />
                                </Button>
                            </div>
                        ) : (<div></div>)
                        }
                    </div>
                </span>
                {/*divider*/}
                <div className="w-full bg-login-form-card my-6" />
                {/* conditionally mapping the events gathered from the database to the screen  */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-white">Loading...</p>
                    </div>
                ) : (!isMobileDevice ?
                    <div className="block md:grid md:grid-cols-2 md:gap-6">
                        {data?.map(event => (
                            <EventCard key={event.id} initialData={event} setIsDelete={setIsDelete} eventClick={eventClick}/>
                        ))}
                    </div> :
                    <div className="block md:grid md:grid-cols-2 md:gap-6">
                        {data?.map(event => (
                            <MobileEventCard key={event.id} initialData={event} eventClick={eventClick} />
                        ))}
                    </div>
                )}
                {/* 'edit event' pop up */}
                {/* MobilePopup contains the delete popup which is used for both desktop and mobile * see file for more info * */}
                <div className={(isClicked && (isMobileDevice || isDelete)) ? "fixed inset-0 flex items-center justify-center z-50 bg-events-navigation-bg bg-opacity-50 blur-background" : ""}>
                    <MobilePopup isClicked={isClicked} isMobile={isMobileDevice} isDelete={isDelete} setIsDelete={setIsDelete} bizEvent={bizEvent} />
                </div>
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
            description: "I am a description",
            elocation: "UBC",
            ename: "cool event",
            startDate: "2024-07-01T07:00:11.131Z",
            endDate: "2024-07-01T21:00:11.131Z",
            imageUrl: "https://i.picsum.photos/id/236/700/400.jpg",
            updatedAt: 1581227718674
        })
    }

    return data
}