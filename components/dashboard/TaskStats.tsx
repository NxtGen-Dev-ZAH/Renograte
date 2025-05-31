"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TaskStats() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [pendingTasks, setPendingTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [change, setChange] = useState<string | null>(null);

  // Fetch task stats
  useEffect(() => {
    const fetchTaskStats = async () => {
      if (!session?.user) return;
      
      setLoading(true);
      try {
        // Fetch all tasks to calculate stats
        const response = await fetch('/api/tasks');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        const tasks = data.tasks || [];
        
        // Calculate pending tasks (not completed)
        const pending = tasks.filter((task: any) => task.status !== 'completed').length;
        
        // Calculate change percentage (mock data for now)
        // In a real app, you would compare with historical data
        const previousCount = localStorage.getItem('previousPendingTasksCount');
        
        if (previousCount) {
          const prevCount = parseInt(previousCount, 10);
          if (prevCount > 0) {
            const changePercent = ((pending - prevCount) / prevCount) * 100;
            setChange(changePercent.toFixed(1) + '%');
          }
        }
        
        // Store current count for future comparison
        localStorage.setItem('previousPendingTasksCount', pending.toString());
        
        setPendingTasks(pending);
      } catch (error) {
        console.error('Error fetching task stats:', error);
        toast({
          title: "Error",
          description: "Failed to load task statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskStats();
  }, [session]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">
          Pending Tasks
        </CardTitle>
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
            <div className="text-2xl font-bold">{pendingTasks}</div>
            {change && (
              <p className={`text-xs ${
                change.startsWith('-') ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.startsWith('-') ? '' : '+'}{change} from last week
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 