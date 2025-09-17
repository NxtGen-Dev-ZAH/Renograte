"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckIcon, XIcon, ClockIcon, UsersIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EarlyAccessUser {
  id: string;
  status: string;
  company?: string;
  phone: string;
  businessType: string;
  licenseNumber?: string;
  plan: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

interface QuotaStatus {
  role: string;
  currentCount: number;
  maxCount: number;
  available: number;
  percentage: number;
}

export default function AdminEarlyAccessPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<EarlyAccessUser[]>([]);
  const [quotas, setQuotas] = useState<QuotaStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<EarlyAccessUser | null>(
    null
  );
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchEarlyAccessUsers();
  }, []);

  const fetchEarlyAccessUsers = async () => {
    try {
      const response = await fetch("/api/admin/early-access");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setQuotas(data.quotas);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch early access users",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch early access users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: "approve" | "reject") => {
    setActionLoading(userId);

    try {
      const response = await fetch("/api/admin/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action,
          feedback: feedback.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });

        // Refresh the list
        await fetchEarlyAccessUsers();
        setSelectedUser(null);
        setAction(null);
        setFeedback("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to process action",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process action",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openActionDialog = (
    user: EarlyAccessUser,
    action: "approve" | "reject"
  ) => {
    setSelectedUser(user);
    setAction(action);
    setFeedback("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckIcon className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XIcon className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors =
      role === "agent"
        ? "bg-blue-100 text-blue-800"
        : "bg-green-100 text-green-800";
    return (
      <Badge className={colors}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading early access users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-8 mt-8 h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-8">
          Early Access Management
        </h1>
        <p className="text-gray-600">
          Review and approve early access applications
        </p>
      </div>

      {/* Quota Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quotas.map((quota) => (
          <Card key={quota.role}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                {quota.role.charAt(0).toUpperCase() + quota.role.slice(1)}s
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {quota.currentCount}/{quota.maxCount}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${quota.percentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                {quota.available} spots remaining ({quota.percentage}% filled)
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending early access applications
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {user.user.name}
                        </h3>
                        {getRoleBadge(user.user.role)}
                        {getStatusBadge(user.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Email:</strong> {user.user.email}
                        </div>
                        <div>
                          <strong>Phone:</strong> {user.phone}
                        </div>
                        <div>
                          <strong>Company:</strong> {user.company || "N/A"}
                        </div>
                        <div>
                          <strong>Business Type:</strong> {user.businessType}
                        </div>
                        {user.licenseNumber && (
                          <div>
                            <strong>License:</strong> {user.licenseNumber}
                          </div>
                        )}
                        <div>
                          <strong>Applied:</strong>{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {user.status === "pending" && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => openActionDialog(user, "approve")}
                          disabled={actionLoading === user.user.id}
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => openActionDialog(user, "reject")}
                          disabled={actionLoading === user.user.id}
                        >
                          <XIcon className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={!!selectedUser && !!action}
        onOpenChange={() => {
          setSelectedUser(null);
          setAction(null);
          setFeedback("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Early Access
              Application
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? `Approve ${selectedUser?.user.name}'s early access application?`
                : `Reject ${selectedUser?.user.name}'s early access application?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder={
                  action === "approve"
                    ? "Add any notes about the approval..."
                    : "Provide reason for rejection..."
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null);
                setAction(null);
                setFeedback("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedUser &&
                action &&
                handleAction(selectedUser.user.id, action)
              }
              disabled={actionLoading === selectedUser?.user.id}
              className={
                action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionLoading === selectedUser?.user.id
                ? "Processing..."
                : action === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
