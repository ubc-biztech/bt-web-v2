import React from "react";
import Image from "next/image";
import { X, Users, ScanLine } from "lucide-react";

interface ConnectionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  // mock data for now 
  const mockUser = {
    name: "FirstName LastName",
    details: "Year 4, BUCS · He / Him",
    profileImage: "/assets/biztech_logo.svg" 
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose} 
    >
      <div 
        className="bg-[#131F3B] rounded-2xl p-4 sm:p-6 w-full max-w-sm mx-4 relative border border-[#374566]"
        style={{
          boxShadow: 'inset 0 0 48px rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors"
        >
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>


        <div className="text-center mb-4 sm:mb-6 mt-2 sm:mt-4">
          <div className="flex justify-center mb-2">
            <ScanLine className="text-[#BDC8E3] w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-[#BDC8E3] text-xs sm:text-sm font-medium tracking-wide font-urbanist">
            BIZCARD SCANNED
          </h3>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-300 border-2 border-white/20">
              <Image
                src={mockUser.profileImage}
                alt={mockUser.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-white text-lg sm:text-xl font-semibold mb-1">
            {mockUser.name}
          </h2>
          <p className="text-[#BDC8E3] text-xs sm:text-sm font-medium font-urbanist">
            {mockUser.details}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            className="w-[140px] h-[48px] sm:w-[155px] sm:h-[56px] bg-[#BDC8E3] bg-opacity-20 border border-[#BDC8E3] text-[#BDC8E3] rounded-lg font-medium hover:bg-[#BDC8E3]/10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            onClick={() => {
              // TODO: how to handle connection logic 
              console.log('Connect clicked');
            }}
          >
            <Users size={14} className="text-[#BDC8E3] sm:w-4 sm:h-4" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;