import { Loader2 } from "lucide-react";

export default function MyListingsLoading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading your listings...</p>
      </div>
    </div>
  );
} 