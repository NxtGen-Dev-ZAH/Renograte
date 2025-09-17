"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

// Types for dashboard data
interface Listing {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  listingPrice: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: string;
  status: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | Date;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  listings: Listing[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  updateListing: (listingId: string, updates: Partial<Listing>) => void;
}

const DashboardContext = createContext<DashboardData | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Single API call for both listings and tasks using Promise.all
      const [listingsRes, tasksRes] = await Promise.all([
        fetch(`/api/listings?agentId=${session.user.id}`),
        fetch("/api/tasks"),
      ]);

      if (!listingsRes.ok) {
        throw new Error("Failed to fetch listings");
      }

      if (!tasksRes.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const [listingsData, tasksData] = await Promise.all([
        listingsRes.json(),
        tasksRes.json(),
      ]);

      setListings(listingsData.listings || []);
      setTasks(tasksData.tasks || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update task in local state (optimistic update)
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  // Add task to local state
  const addTask = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
  };

  // Remove task from local state
  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  // Update listing in local state
  const updateListing = (listingId: string, updates: Partial<Listing>) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === listingId ? { ...listing, ...updates } : listing
      )
    );
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session?.user?.id]);

  return (
    <DashboardContext.Provider
      value={{
        listings,
        tasks,
        loading,
        error,
        refreshData: fetchDashboardData,
        updateTask,
        addTask,
        removeTask,
        updateListing,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};

// Helper hooks for specific data
export const useListings = () => {
  const { listings, loading, error, refreshData, updateListing } =
    useDashboard();
  return { listings, loading, error, refreshData, updateListing };
};

export const useTasks = () => {
  const {
    tasks,
    loading,
    error,
    refreshData,
    updateTask,
    addTask,
    removeTask,
  } = useDashboard();
  return {
    tasks,
    loading,
    error,
    refreshData,
    updateTask,
    addTask,
    removeTask,
  };
};

// Helper hook for listing stats
export const useListingStats = () => {
  const { listings, loading, error } = useDashboard();

  const stats = {
    total: listings.length,
    approved: listings.filter((listing) => listing.status === "approved")
      .length,
    pending: listings.filter((listing) => listing.status === "pending").length,
    rejected: listings.filter((listing) => listing.status === "rejected")
      .length,
  };

  return { stats, loading, error };
};

// Helper hook for task stats
export const useTaskStats = () => {
  const { tasks, loading, error } = useDashboard();

  const stats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status !== "completed").length,
    completed: tasks.filter((task) => task.status === "completed").length,
  };

  return { stats, loading, error };
};
