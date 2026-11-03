import { GymDashboard } from "@/components/gym/GymDashboard";

export const metadata = {
  title: "Communication Agility Gym | Hakkiri Studio",
  description: "Daily spontaneous articulation drills, neuromuscular speech training, and instant executive feedback.",
};

export default function GymPage() {
  return (
    <div className="py-2">
      <GymDashboard />
    </div>
  );
}
