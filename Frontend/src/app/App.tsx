import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { LocationSelector } from "./components/LocationSelector";
import { Dashboard } from "./components/Dashboard";

type Page = "landing" | "location" | "dashboard";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedLocation, setSelectedLocation] = useState<{
    state: string;
    city: string;
  } | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleLocationSelect = (state: string, city: string) => {
    setSelectedLocation({ state, city });
    setCurrentPage("dashboard");
  };

  const handleBack = () => {
    setCurrentPage("location");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {currentPage === "landing" && (
          <LandingPage onNavigate={handleNavigate} />
        )}
        
        {currentPage === "location" && (
          <LocationSelector onLocationSelect={handleLocationSelect} />
        )}
        
        {currentPage === "dashboard" && selectedLocation && (
          <Dashboard
            city={selectedLocation.city}
            state={selectedLocation.state}
            onBack={handleBack}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;