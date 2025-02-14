"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function TrialDialog() {
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#0C71C3] hover:bg-[#0C71C3]/90">
          Start Free Trial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Your Free Trial</DialogTitle>
          <DialogDescription>
            Choose how you'd like to proceed with your free trial of Renograte.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button
            variant="outline"
            onClick={() => router.push("/free-trial")}
            className="justify-start"
          >
            Complete Registration
            <span className="ml-auto text-xs text-gray-500">2-3 minutes</span>
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open("https://calendly.com/your-link", "_blank")
            }
            className="justify-start"
          >
            Schedule a Demo
            <span className="ml-auto text-xs text-gray-500">15 minutes</span>
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <div className="text-xs text-gray-500">
            Try risk-free for 90 days. Easy cancellation before billing starts.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
