import { FC } from 'react';

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
            {userData?.profilePicUrl ? (
                <img 
                    src={userData.profilePicUrl}
                    alt={`${userData.name}'s profile picture`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mb-3 sm:mb-4 scale-125"
                />
            ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-baby-blue flex items-center justify-center text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-black">
                    {userData.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
            )}
            <h5 className="text-xl sm:text-2xl text-white font-sans mb-1">{userData.name}</h5>
            <p className="text-xs sm:text-sm text-light-grey uppercase font-redhat">{userData.role}</p>
        </div>
    );
};

export default Profile;