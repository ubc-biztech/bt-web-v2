import { useRouter } from 'next/router'
import { Attendee } from "@/components/RegistrationTable/columns";
import EventCard from "@/components/EventCard/event-card"
import { useEffect, useState } from "react";
import { GetServerSideProps } from 'next'

import GridViewIcon from "../../../public/assets/icons/grid_view_icon.svg"
import CompactViewIcon from "../../../public/assets/icons/compact_view_icon.svg"
import { Button } from "@/components/ui/button"
import { Grid } from 'lucide-react';
import Image from 'next/image';

type Props = {
    initialData: Attendee[] | null
}



// for props, refer to victor's code for making the calls to the database for event data.
export default function AdminEvent({ initialData }: Props) {

    return (
        <main className="bg-primary-color min-h-screen">
            <div className="container mx-auto p-20 flex flex-col">
                <span>
                    <h2 className="text-white">Admin Event Portal</h2>
                    <div className="flex items-center justify-between">
                        <p className="text-baby-blue font-poppins">Manage published Biztech events.</p>
                        <div>
                            <Button variant="ghost" className='bg-transparent'>
                                <Image src={GridViewIcon} alt="Grid View Icon"/>
                            </Button>
                            <Button variant="ghost" className='bg-transparent'>
                                <Image src={CompactViewIcon} alt="Compact View Icon"/>
                            </Button>
                        </div>
                    </div>
                </span>
                {/*divider*/}
                <div className="w-full h-[2px] bg-login-form-card my-6" />
                <div className="grid grid-cols-2 gap-6">
                    <EventCard/>
                    <EventCard/>
                    <EventCard/>
                    <EventCard/>
                </div>
            </div>
        </main>
    );
}

