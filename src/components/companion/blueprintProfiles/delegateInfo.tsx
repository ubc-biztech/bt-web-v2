import { CompanionButton } from '../../ui/companion-button';
import { AnimatedBorder } from '../../ui/animated-border';
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { FC } from 'react';
import { UserProfile } from '@/types';


const CompanyInfo: FC<{ userData: UserProfile }> = ({ userData }) => {
    const visitPageLink = `/companion/profile/company/${userData.companyProfileID}`
    return (
        <AnimatedBorder className="w-full mb-3">
            <div className="rounded-lg py-6 pl-2">
                {/* <div className="bg-[#1A1A1A] rounded-lg p-6 shadow-lg"> */}
                <div className="flex flex-col space-y-2">
                    {/* Top Row */}
                    <div className="flex items-start">
                        <div className="flex flex-col mr-16">
                            <span className="text-light-grey font-redhat tracking-wider mb-2">
                                COMPANY
                            </span>
                            <span className="text-white text-sm font-medium">
                                {userData.company || '-'}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-light-grey font-redhat uppercase tracking-wider mb-2">
                                ROLE
                            </span>
                            <span className="text-white text-sm font-medium">
                                {userData.role || '-'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-light-grey font-redhat tracking-wider mb-2">
                            PRONOUNS
                        </span>
                        <span className="text-white text-sm font-medium">
                            {userData.pronouns || '-'}
                        </span>
                    </div>

                    {/* Bottom Row */}

                    {/* </div> */}
                </div>

            </div>
        </ AnimatedBorder>
    );
};

export default CompanyInfo;