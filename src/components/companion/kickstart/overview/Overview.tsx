import React, { useEffect, useState } from 'react'
import { useTeam } from '@/components/companion/events/Kickstart2025';
import Header from './header/Header';
import Stats from './metrics/Stats';
import Recent from './metrics/Recent';
import Graph from './graph/Graph';
import { Investment } from './metrics/Recent';
import { fetchBackend } from '@/lib/db';

export interface RawInvestment {
    teamName: string;
    createdAt: number;
    isPartner: boolean;
    'eventID;year': string;
    amount: number;
    teamId: string;
    investorId: string;
    investorName: string;
    comment: string;
    id: string;
}

const Overview = () => {
    const { team } = useTeam();
    const [receivedFunding, setReceivedFunding] = useState<number>(-1);
    const [rawInvestments, setRawInvestments] = useState<RawInvestment[] | null>(null);
    const [recentInvestments, setReceiveInvestments] = useState<Investment[] | null>(null);

    useEffect(() => {
        if (team && team.id) {
            const fetchFundingStatus = async () => {
                try {
                    const data = await fetchBackend({
                        endpoint: `/investments/teamStatus/${team?.id}`,
                        method: "GET",
                        authenticatedCall: true,
                    });

                    console.log(data);

                    if (data) {
                        setReceivedFunding(data.funding || -1);
                        setRawInvestments(data.investments || null);
                        setReceiveInvestments(processInvestments(data.investments) || []);
                    }
                }
                catch (error) {
                    console.error("Error fetching investments data:", error);
                }
            };
            fetchFundingStatus();
        }
    }, [team]);

    return (
        <div className='w-[90%] flex flex-col pb-20'>
            <Header teamName={team?.teamName || ""} />
            <div className='w-full h-[6em] flex flex-row mt-4'>
                <Graph investments={rawInvestments || []}/>
                <div className='w-2/5 h-full flex flex-col gap-3'>
                    <Stats received={receivedFunding}/>
                    <Recent investments={recentInvestments}/>
                </div>
            </div>
        </div>
    )
}

const processInvestments = (rawInvestments: RawInvestment[]): Investment[] => {
    if (!rawInvestments || rawInvestments.length === 0) {
        return [];
    }

    const sortedInvestments = [...rawInvestments].sort((a, b) => b.createdAt - a.createdAt);

    return sortedInvestments.map(item => {
        const date = new Date(item.createdAt);

        const formatTimestamp = (d: Date): string => {
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const year = String(d.getFullYear()).slice(-2);

            let hours = d.getHours();
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';

            hours = hours % 12;
            hours = hours ? hours : 12;

            return `${month}-${day}-${year} - ${hours}:${minutes}${ampm}`;
        };

        return {
            investorName: item.investorName,
            amount: item.amount,
            timestamp: formatTimestamp(date),
        };
    });
};

export default Overview