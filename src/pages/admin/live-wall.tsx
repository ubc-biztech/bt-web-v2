"use client";

import ConnectionWall from "../../components/LiveWall/ConnectionWall";

export default function LiveWallPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-8 py-6">
        <ConnectionWall />
      </div>
    </div>
  );
}
