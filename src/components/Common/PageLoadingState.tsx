import { Spinner } from "../ui/spinner";

export default function PageLoadingState() {
  return (
    <div className="flex flex-row text-pale-blue w-full justify-center items-center">
      <Spinner variant="circle-filled" />
    </div>
  );
}
