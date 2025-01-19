import { FC } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface UserProfile {
    name: string;
    role: string;
    profilePicUrl?: string;
}

interface ProfileProps {
    userData: UserProfile;
}

const Profile: FC<ProfileProps> = ({ userData }) => {
    return (
        <div className="flex flex-col items-center mb-6 sm:mb-8">
            <Avatar
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-baby-blue flex items-center justify-center text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-black`}
            >
                <AvatarImage src={userData?.profilePicUrl} className="w-full h-full object-cover rounded-full" />
                <AvatarFallback>{userData.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h5 className="text-xl sm:text-2xl text-center text-white font-sans mb-1">{userData.name}</h5>
            <p className="text-xs sm:text-sm text-light-grey uppercase font-redhat">{userData.role}</p>
        </div>
    );
};

export default Profile;