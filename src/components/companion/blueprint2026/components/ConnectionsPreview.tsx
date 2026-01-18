import BluePrintCard from "./BluePrintCard";
import BluePrintButton from "./BluePrintButton";
import { Connection } from "@/pages/connections";

export default function ConnectionsPreview({
  connections,
}: {
  connections: Connection[] | undefined;
}) {
  return (
    <BluePrintCard>
      <div className="flex flex-row items-center justify-between">
        <div className="text-md font-medium">Your Connections</div>
        <BluePrintButton className="text-xs p-4">VIEW ALL</BluePrintButton>
      </div>
      <div className="h-[0.5px] mt-2 w-full bg-gradient-to-r from-transparent via-white to-transparent" />

      {!connections || connections?.length <= 0 ? (
        <div className="mx-16 my-4 text-center opacity-80">{"No connections yet. Tap someone's NFC to get started!"}</div>
      ) : (
        connections.map((c) => <div key={c.connectionID}></div>)
      )}
    </BluePrintCard>
  );
}
