export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-[#0C71C3] animate-spin"></div>
        <div className="h-16 w-16 rounded-full border-r-2 border-l-2 border-cyan-400 animate-pulse absolute top-0 left-0"></div>
      </div>
    </div>
  );
}
