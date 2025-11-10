import React from 'react'
import { GlowButton } from '../../ui/GlowButton';
import { useTeam } from '@/components/companion/events/Kickstart2025';
import { Ticker } from '@/components/companion/kickstart/overview/header/Ticker';
import { Plus } from 'lucide-react';
const Header = ({}) => {
    const { team } = useTeam();

    return (
        <div className='w-full h-30 flex flex-col items-center jusitfy-center mt-14'>
            <div className="w-full flex flex-row items-end justify-between text-[24px]">
                <header className='font-instrument text-[42px] flex items-end leading-none'>biz.ai</header>
                <Ticker />
                <GlowButton href="/companion" height='h-10' width='w-48' icon={Plus}>
                    <span className='text-[14px]'>
                        New Investments
                    </span>
                </GlowButton>
            </div>
        </div>
    )
}

export default Header