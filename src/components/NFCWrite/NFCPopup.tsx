import React, { useState, useEffect } from "react";
import NFCWriter from "./NFCWriter";
//flow:
// 1. This pops up and takes in a user ID and an Image
// 2. nfc popup appears
// 3. user taps on the nfc button
// 4. nfc popup disappears
// 5. nfc writer component appears
// 6. user taps on the nfc button
// 7. nfc writer component disappears or writer component AND this component disappear

type NfcPopupProps = {
  name: string;
  userId: string;
  image: string;
  exit: () => void;
};

const NfcPopup: React.FC<NfcPopupProps> = ({ name, userId, image, exit }) => {
  const [showWriter, setShowWriter] = useState(false);
  const [isDeviceSupported, setIsDeviceSupported] = useState(false);

  useEffect(() => {
    const checkDeviceSupport = () => {
      if (!("NDEFReader" in window)) {
        return false;
      }
      return true;
    };

    setIsDeviceSupported(checkDeviceSupport());
  }, []);

  const openWriter = () => {
    setShowWriter(true);
  };

  const closeWriter = () => {
    setShowWriter(false);
  };

  const closeAll = () => {
    setShowWriter(false);
    exit();
  };

  return (
    <>
      {!isDeviceSupported ? (
        <DeviceNotSupported name={name} manualWrite={false} />
      ) : (
        <div>
          <NfcPopupContent name={name} image={image} openWriter={openWriter} />

          {showWriter && (
            <NFCWriter
              token={userId}
              exit={closeWriter}
              profileSrc={image}
              closeAll={closeAll}
            ></NFCWriter>
          )}
        </div>
      )}
      <button> close </button>
    </>
  );
};

const DeviceNotSupported = ({
  name,
  manualWrite,
}: {
  name: string;
  manualWrite: boolean;
}) => {
  return (
    <div>
      {manualWrite ? (
        <div>
          Device not compatible, please find a an exec with an anroid device to
          help.
        </div>
      ) : (
        <div>
          {name} does not have a Membership Card.
          <br></br> Write manually
        </div>
      )}
    </div>
  );
};

const NfcPopupContent = ({
  name,
  image,
  openWriter,
}: {
  name: string;
  image: string;
  openWriter: () => void;
}) => {
  return (
    <div>
      <div>
        {name} does not have a membership card. Swipe up to write to card
      </div>
      <div onClick={openWriter}>Write to NFC</div>
    </div>
  );
};

export default NfcPopup;
