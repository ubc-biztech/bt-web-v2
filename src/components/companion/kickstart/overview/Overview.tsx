import React, { useEffect } from 'react'
import { useUserRegistration } from '@/pages/companion';
import { useTeam } from '@/components/companion/events/Kickstart2025';
import Header from './header/Header';

const Overview = () => {
    const { team } = useTeam();

    useEffect(() => {
        console.log("User's team in Overview:", team);
    }, [team]);

    return (
        <div className='w-[90%]'>
            <Header />
        </div>
    )
}

export default Overview