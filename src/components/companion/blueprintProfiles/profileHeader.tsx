import { FC } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface CompanyProfile {
    fname?: string;
    lname?: string;
    name?: string;
    type?: string;
    profilePictureURL?: string;
}

interface ProfileProps {
    userData: CompanyProfile;
}

const Profile: FC<ProfileProps> = ({ userData }) => {
    let initials = '';
    let name = '';

    if (userData.fname && userData.lname) {
        initials = userData.fname[0] + userData.lname[0];
        name = userData.fname + " " + userData.lname;
    }
    
    if (userData.name) {
        initials = userData.name[0];
        name = userData.name;
    }

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        event.currentTarget.src = ''; // Set to a default image URL or leave empty for fallback initials
    };
    
    return (
        <div className="flex flex-col items-center mb-6 sm:mb-8">
            <Avatar
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-baby-blue flex items-center justify-center text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-black`}
            >
                <AvatarImage 
                    src={userData.profilePictureURL || ''} 
                    className="w-full h-full object-cover rounded-full" 
                    onError={handleImageError}
                />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <h5 className="text-xl sm:text-2xl text-center text-white font-sans mb-1">{name}</h5>
            <p className="text-xs sm:text-sm text-light-grey uppercase font-redhat">{userData.type}</p>
        </div>
    );
};

export default Profile;