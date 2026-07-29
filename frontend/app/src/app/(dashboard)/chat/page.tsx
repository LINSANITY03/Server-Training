"use client";
import { getAllergy, getTrainingConfig } from "@/lib/training";
import { Allergy, SessionScenario } from "@/types/training";
import {
  AlertTriangle,
  ChevronDown,
  Info,
  MessageSquare,
  Mic,
  Play,
  Users,
  UtensilsCrossed,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionType = "text" | "audio" | "video";

export default function ChatSetupPage() {
  const router = useRouter();
  const [sessionType, setSessionType] = useState<SessionType>("text");

  const [scenario, setScenario] = useState<SessionScenario[]>([]);
  const [selectedScenario, setSelectedScenario] =
    useState<SessionScenario | null>(null);

  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);

        const config = await getTrainingConfig();
        const allergy = await getAllergy();

        setScenario(config.results);
        setAllergies(allergy.results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  const toggleAllergy = (a: Allergy) => {
    setSelectedAllergies((prev) =>
      prev.some((x) => x.id === a.id)
        ? prev.filter((x) => x.id !== a.id)
        : [...prev, a]
    );
  };

  const handleStart = async () => {
    if (!scenario) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 100));
    router.push(`/chat/session?id=asd`);
  };

  const sessionTypes = [
    {
      id: "text" as SessionType,
      label: "Text Chat",
      icon: MessageSquare,
      available: true,
      desc: "Type-based interaction",
    },
    {
      id: "audio" as SessionType,
      label: "Audio",
      icon: Mic,
      available: false,
      desc: "Voice interaction",
    },
    {
      id: "video" as SessionType,
      label: "Video",
      icon: Video,
      available: false,
      desc: "Full video simulation",
    },
  ];

  const isReady = scenario;

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#F0F5F0" }}>
          New Training Session
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6B8F7A" }}>
          Configure your scenario before starting
        </p>
      </div>

      <div className="space-y-6">
        {/* Session type */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "#1A3A2A",
            border: "1px solid rgba(45,122,79,0.2)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "#A8E0C1" }}
          >
            <MessageSquare className="w-4 h-4" /> Session Type
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {sessionTypes.map(({ id, label, icon: Icon, available, desc }) => (
              <button
                key={id}
                onClick={() => available && setSessionType(id)}
                disabled={!available}
                className="relative p-4 rounded-xl text-left transition-all"
                style={{
                  background:
                    sessionType === id
                      ? "rgba(45,122,79,0.25)"
                      : "rgba(45,122,79,0.05)",
                  border:
                    sessionType === id
                      ? "1px solid #2D7A4F"
                      : "1px solid rgba(45,122,79,0.15)",
                  opacity: available ? 1 : 0.5,
                  cursor: available ? "pointer" : "not-allowed",
                }}
              >
                <Icon
                  className="w-5 h-5 mb-2"
                  style={{ color: sessionType === id ? "#4DB882" : "#6B8F7A" }}
                />
                <div
                  className="text-sm font-medium"
                  style={{ color: "#F0F5F0" }}
                >
                  {label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#6B8F7A" }}>
                  {desc}
                </div>
                {!available && (
                  <span
                    className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(91,33,182,0.3)",
                      color: "#A78BFA",
                      fontSize: "9px",
                    }}
                  >
                    SOON
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "#1A3A2A",
            border: "1px solid rgba(45,122,79,0.2)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "#A8E0C1" }}
          >
            <UtensilsCrossed className="w-4 h-4" /> Scenario
          </h3>
          <div className="relative">
            <select
              value={selectedScenario?.id ?? ""}
              onChange={(e) => {
                const selected = scenario.find(
                  (s) => s.id === Number(e.target.value)
                );
                setSelectedScenario(selected ?? null);
              }}
              className="w-full px-4 py-3 rounded-xl text-sm appearance-none outline-none"
              style={{
                background: "#0D1F15",
                border: "1px solid rgba(45,122,79,0.3)",
                color: scenario ? "#F0F5F0" : "#6B8F7A",
              }}
            >
              <option value="">Select a scenario...</option>
              {scenario.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "#6B8F7A" }}
            />
          </div>
        </div>

        {/* Guest count + Dining type */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "#1A3A2A",
              border: "1px solid rgba(45,122,79,0.2)",
            }}
          >
            <h3
              className="text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: "#A8E0C1" }}
            >
              <Users className="w-4 h-4" /> Guests
            </h3>
            <div className="flex items-center gap-4">
              <span
                className="text-2xl font-bold w-10 text-center"
                style={{ color: "#F0F5F0" }}
              >
                {selectedScenario?.guest_count}
              </span>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl"
            style={{
              background: "#1A3A2A",
              border: "1px solid rgba(45,122,79,0.2)",
            }}
          >
            <h3
              className="text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: "#A8E0C1" }}
            >
              <UtensilsCrossed className="w-4 h-4" /> Dining Type
            </h3>
            <div className="relative">
              <input
                value={selectedScenario?.dining_type.name || ""}
                readOnly
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "#0D1F15",
                  border: "1px solid rgba(45,122,79,0.3)",
                  color: selectedScenario?.dining_type ? "#F0F5F0" : "#6B8F7A",
                }}
              />
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "#1A3A2A",
            border: "1px solid rgba(45,122,79,0.2)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-1 flex items-center gap-2"
            style={{ color: "#A8E0C1" }}
          >
            <AlertTriangle className="w-4 h-4" /> Dietary Restrictions &
            Allergies
          </h3>
          <p className="text-xs mb-4" style={{ color: "#6B8F7A" }}>
            Selected
          </p>
          <div className="flex flex-wrap gap-2">
            {allergies.map((a) => {
              const selected = selectedAllergies.includes(a);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAllergy(a)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selected
                      ? "rgba(248,113,113,0.2)"
                      : "rgba(45,122,79,0.1)",
                    border: selected
                      ? "1px solid rgba(248,113,113,0.5)"
                      : "1px solid rgba(45,122,79,0.2)",
                    color: selected ? "#F87171" : "#6B8F7A",
                  }}
                >
                  {selected ? "✓ " : ""}
                  {a.name}
                </button>
              );
            })}
          </div>
          {allergies.length > 0 && (
            <p className="text-xs mt-3" style={{ color: "#FBBF24" }}>
              ⚠ {allergies.length} restriction
              {allergies.length !== 1 ? "s" : ""} active — the AI will test your
              handling
            </p>
          )}
        </div>

        {/* Info box */}
        <div
          className="flex gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(91,33,182,0.1)",
            border: "1px solid rgba(91,33,182,0.2)",
          }}
        >
          <Info
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: "#A78BFA" }}
          />
          <p className="text-xs leading-relaxed" style={{ color: "#A78BFA" }}>
            The AI will simulate realistic guest behaviour including complaints,
            special requests, and unexpected events based on your scenario
            setup.
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!isReady || loading}
          className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: isReady
              ? "linear-gradient(135deg, #2D7A4F, #38966A)"
              : "rgba(45,122,79,0.2)",
            color: isReady ? "#F0F5F0" : "#3A5A45",
            cursor: isReady ? "pointer" : "not-allowed",
          }}
        >
          <Play className="w-5 h-5" />
          Start Training Session
        </button>
      </div>
    </div>
  );
}
