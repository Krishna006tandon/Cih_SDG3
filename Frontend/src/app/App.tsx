import { useState } from "react";
import { LocationSelector } from "./components/LocationSelector";
import { Dashboard } from "./components/Dashboard";
import GeminiChatBot from "./components/GeminiChatBot";

export default function App() {
  const [view, setView] = useState<"selector" | "dashboard">("selector");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const handleLocationSelect = (state: string, city: string) => {
    setSelectedState(state);
    setSelectedCity(city);
    setView("dashboard");
  };

  const handleBack = () => {
    setView("selector");
  };

  if (view === "dashboard" && selectedCity) {
    return (
      <>
        <Dashboard
          state={selectedState}
          city={selectedCity}
          onBack={handleBack}
        />
        <GeminiChatBot />
      </>
    );
  }

  return (
    <>
      <LocationSelector onLocationSelect={handleLocationSelect} />
      <GeminiChatBot />
    </>
  );
}
