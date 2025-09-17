"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskStats } from "@/lib/dashboard-context";

export default function TaskStats() {
  const { toast } = useToast();
  const { stats, loading, error } = useTaskStats();
  const [change, setChange] = useState<string | null>(null);

  // Calculate change percentage (mock data for now)
  useEffect(() => {
    if (stats.pending > 0) {
      const previousCount = localStorage.getItem("previousPendingTasksCount");

      if (previousCount) {
        const prevCount = parseInt(previousCount, 10);
        if (prevCount > 0) {
          const changePercent = ((stats.pending - prevCount) / prevCount) * 100;
          setChange(changePercent.toFixed(1) + "%");
        }
      }

      // Store current count for future comparison
      localStorage.setItem(
        "previousPendingTasksCount",
        stats.pending.toString()
      );
    }
  }, [stats.pending]);

  // Show error if there's one
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load task statistics",
      variant: "destructive",
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
        <div className="p-2 rounded-full bg-purple-50">
          <ListChecks className="h-4 w-4 text-purple-600" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 flex items-center">
            <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{stats.pending}</div>
            {change && (
              <p
                className={`text-xs ${
                  change.startsWith("-") ? "text-green-600" : "text-red-600"
                }`}
              >
                {change.startsWith("-") ? "" : "+"}
                {change} from last week
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
