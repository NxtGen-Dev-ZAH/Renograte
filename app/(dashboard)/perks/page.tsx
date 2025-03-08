"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Award, Crown, Zap, Shield , Users} from "lucide-react";

const perks = [
  {
    id: 1,
    name: "Premium Listing",
    description: "Get your property featured at the top of search results",
    points: 500,
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    id: 2,
    name: "Professional Photography",
    description: "Professional photo shoot for your property",
    points: 1000,
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    id: 3,
    name: "Virtual Tour",
    description: "Create an immersive 3D virtual tour",
    points: 1500,
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: 4,
    name: "Property Insurance",
    description: "One month free property insurance",
    points: 2000,
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
];

const recentRewards = [
  {
    id: 1,
    name: "Premium Listing Reward",
    date: "May 1, 2024",
    points: 500,
  },
  {
    id: 2,
    name: "Referral Bonus",
    date: "April 28, 2024",
    points: 250,
  },
  {
    id: 3,
    name: "Property Upload",
    date: "April 25, 2024",
    points: 100,
  },
];

export default function PerksPage() {
  const totalPoints = 1250;
  const nextTier = 2000;
  const progress = (totalPoints / nextTier) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Property Perks</h2>
        <p className="text-muted-foreground">
          Earn and redeem points for exclusive property-related rewards
        </p>
      </div>

      {/* Points Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Your Points Balance</h3>
              <p className="text-3xl font-bold text-[#0C71C3]">{totalPoints} points</p>
            </div>
            <div className="p-3 rounded-full bg-[#0C71C3] bg-opacity-10">
              <Gift className="h-6 w-6 text-[#0C71C3]" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next tier</span>
              <span>{totalPoints} / {nextTier}</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Available Perks */}
      <div className="grid gap-6 md:grid-cols-2">
        {perks.map((perk) => {
          const Icon = perk.icon;
          return (
            <Card key={perk.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${perk.bgColor}`}>
                    <Icon className={`h-6 w-6 ${perk.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{perk.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {perk.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{perk.points} points</span>
                      <Button
                        variant="outline"
                        disabled={totalPoints < perk.points}
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Rewards</CardTitle>
          <CardDescription>Your recent point earnings and redemptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{reward.name}</p>
                  <p className="text-sm text-muted-foreground">{reward.date}</p>
                </div>
                <span className={`font-medium ${reward.points > 0 ? "text-green-600" : "text-red-600"}`}>
                  {reward.points > 0 ? "+" : "-"}{reward.points} points
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle>How to Earn Points</CardTitle>
          <CardDescription>Ways to earn more perks and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-[#0C71C3]" />
              <h4 className="font-medium">List Properties</h4>
              <p className="text-sm text-muted-foreground">
                Earn 100 points per listing
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-[#0C71C3]" />
              <h4 className="font-medium">Refer Friends</h4>
              <p className="text-sm text-muted-foreground">
                Earn 250 points per referral
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-[#0C71C3]" />
              <h4 className="font-medium">Complete Profile</h4>
              <p className="text-sm text-muted-foreground">
                Earn 500 points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 