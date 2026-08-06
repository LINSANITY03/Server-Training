"use client";

import { createSession, getAllergy, getTrainingConfig } from "@/lib/training";

import { Allergy, SessionScenario } from "@/types/training";

import {
  AlertTriangle,
  ChevronRight,
  MessageSquare,
  Mic,
  Play,
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionType = "text" | "audio" | "video";

const personalities = [
  {
    id: "friendly",
    label: "Friendly",
    description: "Patient and cooperative",
  },
  {
    id: "quiet",
    label: "Quiet",
    description: "Minimal conversation",
  },
  {
    id: "talkative",
    label: "Talkative",
    description: "Likes detailed discussions",
  },
  {
    id: "impatient",
    label: "Impatient",
    description: "Tests your service skills",
  },
  {
    id: "formal",
    label: "Formal",
    description: "Professional interaction",
  },
];

const knowledgeLevels = [
  {
    id: "low",
    label: "Low",
    description: "Needs explanations",
  },
  {
    id: "medium",
    label: "Medium",
    description: "Normal guest knowledge",
  },
  {
    id: "high",
    label: "High",
    description: "Experienced guest",
  },
];

const occasions = [
  {
    id: "birthday",
    label: "Birthday"
  },
  {
    id: "anniversary",
    label: "Anniversary"
  }
]
export default function ChatSetupPage() {
  const router = useRouter();

  const [sessionType, setSessionType] = useState<SessionType>("text");

  const [scenarios, setScenarios] = useState<SessionScenario[]>([]);

  const [selectedScenario, setSelectedScenario] =
    useState<SessionScenario | null>(null);

  const [allergies, setAllergies] = useState<Allergy[]>([]);

  const [selectedAllergies, setSelectedAllergies] = useState<Allergy[]>([]);

  const [guestCount, setGuestCount] = useState(2);

  const [personality, setPersonality] = useState("friendly");

  const [knowledgeLevel, setKnowledgeLevel] = useState("low");

  const [occasion, setOccasion] = useState("")

  const [note, setNote] = useState("")

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const config = await getTrainingConfig();

        const allergy = await getAllergy();

        setScenarios(config.results);
        setAllergies(allergy.results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function toggleAllergy(allergy: Allergy) {
    setSelectedAllergies((prev) =>
      prev.some((x) => x.id === allergy.id)
        ? prev.filter((x) => x.id !== allergy.id)
        : [...prev, allergy]
    );
  }

  async function handleStart() {
    if (!selectedScenario) return;

    try {
      setLoading(true);

      const payload = {
        scenario: selectedScenario.id,

        guest_profile: {
          guest_count: guestCount,

          personality: personality,

          knowledge_level: knowledgeLevel,

          notes: note,

          allergies: selectedAllergies.map(allergy => allergy.id),
        },
      };

      const response = await createSession(payload);

      if (response.uuid) {
        router.push(`/chat/session?id=${response.uuid}`);
      }
    } catch (error) {
      console.error(error);

      alert("Unable to start training session");
    } finally {
      setLoading(false);
    }
  }

  const ready = selectedScenario !== null && !loading;

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#F0F5F0" }}>
          New Training Session
        </h1>

        <p className="mt-2 text-sm" style={{ color: "#6B8F7A" }}>
          Configure your simulation environment before meeting the guest.
        </p>
      </div>

      <div className="space-y-6">
        {/* Session Type */}

        <section
          className="p-6 rounded-2xl"
          style={{
            background: "#1A3A2A",
            border: "1px solid rgba(45,122,79,.2)",
          }}
        >
          <h3
            className="flex gap-2 items-center mb-4 font-semibold"
            style={{ color: "#A8E0C1" }}
          >
            <MessageSquare className="w-4 h-4" />
            Session Mode
          </h3>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              {
                id: "text",
                label: "Text Chat",
                icon: MessageSquare,
                enabled: true,
              },
              {
                id: "audio",
                label: "Audio",
                icon: Mic,
                enabled: false,
              },
              {
                id: "video",
                label: "Video",
                icon: Video,
                enabled: false,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  disabled={!item.enabled}
                  onClick={() =>
                    item.enabled && setSessionType(item.id as SessionType)
                  }
                  className="p-4 rounded-xl text-left"
                  style={{
                    background:
                      sessionType === item.id
                        ? "rgba(45,122,79,.25)"
                        : "rgba(45,122,79,.05)",

                    border:
                      sessionType === item.id
                        ? "1px solid #2D7A4F"
                        : "1px solid rgba(45,122,79,.2)",

                    opacity: item.enabled ? 1 : 0.4,
                  }}
                >
                  <Icon className="mb-2 w-5 h-5" style={{ color: "#4DB882" }} />

                  <p
                    className="text-sm font-medium"
                    style={{ color: "#F0F5F0" }}
                  >
                    {item.label}
                  </p>

                  {!item.enabled && (
                    <p className="text-xs mt-1" style={{ color: "#A78BFA" }}>
                      Coming soon
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Scenario */}

        <section
          className="p-6 rounded-2xl"
          style={{
            background: "#1A3A2A",
            border: "1px solid rgba(45,122,79,.2)",
          }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "#A8E0C1" }}>
            Choose Scenario
          </h3>

          <div className="space-y-2">
            <label
              htmlFor="scenario"
              className="block text-sm font-medium"
              style={{ color: "#F0F5F0" }}
            >
              Scenario
            </label>

            <select
              id="scenario"
              value={selectedScenario?.id ?? ""}
              onChange={(e) => {
                const scenario = scenarios.find(
                  (s) => String(s.id) === e.target.value
                );
                setSelectedScenario(scenario ?? null);
              }}
              className="w-full p-3 rounded-xl"
              style={{
                background: "#0D1F15",
                color: "#F0F5F0",
                border: "1px solid rgba(45,122,79,.2)",
              }}
            >
              <option value="">Select a scenario</option>

              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {selectedScenario && (
              <p className="text-xs" style={{ color: "#6B8F7A" }}>
                {selectedScenario.description}
              </p>
            )}
          </div>
        </section>

        {/* Guest Profile */}

        <section
          className="p-6 rounded-2xl"
          style={{
            background: "#1A3A2A",
            border: "1px solid rgba(45,122,79,.2)",
          }}
        >
          <h3
            className="flex gap-2 items-center mb-5"
            style={{ color: "#A8E0C1" }}
          >
            <UserRound className="w-4 h-4" />
            Guest Profile
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs" style={{ color: "#6B8F7A" }}>
                Number of Guests
              </label>

              <input
                type="number"
                min={1}
                max={25}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full mt-2 p-3 rounded-xl"
                style={{
                  background: "#0D1F15",
                  color: "#F0F5F0",
                }}
              />
            </div>

            <div>
              <label className="text-xs" style={{ color: "#6B8F7A" }}>
                Knowledge Level
              </label>

              <select
                value={knowledgeLevel}
                onChange={(e) => setKnowledgeLevel(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl"
                style={{
                  background: "#0D1F15",
                  color: "#F0F5F0",
                }}
              >
                {knowledgeLevels.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-xs" style={{ color: "#6B8F7A" }}>
              Personality
            </label>

            <div className="grid md:grid-cols-3 gap-2 mt-2">
              {personalities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className="p-3 rounded-xl text-left"
                  style={{
                    background:
                      personality === p.id ? "rgba(45,122,79,.3)" : "#0D1F15",

                    border:
                      personality === p.id
                        ? "1px solid #4DB882"
                        : "1px solid transparent",
                  }}
                >
                  <p className="text-sm" style={{ color: "#F0F5F0" }}>
                    {p.label}
                  </p>

                  <p className="text-xs" style={{ color: "#6B8F7A" }}>
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div className="mt-5">
            <label className="text-xs" style={{ color: "#6B8F7A" }}>
              Occasion
            </label>

            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl"
              style={{
                background: "#0D1F15",
                color: "#F0F5F0",
              }}
            >
              <option value="">Select occasion</option>
              {occasions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="mt-5">
            <label className="text-xs" style={{ color: "#6B8F7A" }}>
              Notes
            </label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Add any extra details..."
              className="w-full mt-2 p-3 rounded-xl resize-none"
              style={{
                background: "#0D1F15",
                color: "#F0F5F0",
              }}
            />
          </div>
        </section>

        {/* Allergies */}

        <section
          className="p-6 rounded-2xl"
          style={{
            background: "#1A3A2A",
            border: "1px solid rgba(45,122,79,.2)",
          }}
        >
          <h3 className="flex gap-2 mb-4" style={{ color: "#A8E0C1" }}>
            <AlertTriangle className="w-4 h-4" />
            Allergies
          </h3>

          <div className="flex flex-wrap gap-2">
            {allergies.map((a) => {
              const active = selectedAllergies.some((x) => x.id === a.id);

              return (
                <button
                  key={a.id}
                  onClick={() => toggleAllergy(a)}
                  className="px-3 py-2 rounded-full text-xs"
                  style={{
                    background: active ? "rgba(248,113,113,.2)" : "#0D1F15",

                    color: active ? "#F87171" : "#6B8F7A",
                  }}
                >
                  {active ? "✓ " : ""}

                  {a.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Start */}

        <button
          disabled={!ready}
          onClick={handleStart}
          className="w-full py-4 rounded-xl flex justify-center items-center gap-2 font-bold"
          style={{
            background: ready
              ? "linear-gradient(135deg,#2D7A4F,#38966A)"
              : "rgba(45,122,79,.2)",

            color: "#F0F5F0",
          }}
        >
          <Play className="w-5 h-5" />
          Start Training
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
