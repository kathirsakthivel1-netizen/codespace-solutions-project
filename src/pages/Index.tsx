import { useState } from "react";
import { TopDock, type TabId } from "@/components/fridge/BottomDock";
import { WeatherWidget } from "@/components/fridge/WeatherWidget";
import { DashboardView } from "@/components/fridge/DashboardView";
import { NotificationsView } from "@/components/fridge/NotificationsView";
import { VoiceAssistantView } from "@/components/fridge/VoiceAssistantView";
import { TouchscreenView } from "@/components/fridge/TouchscreenView";
import { SettingsView } from "@/components/fridge/SettingsView";
import { InstallPrompt } from "@/components/fridge/InstallPrompt";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <main className="min-h-screen px-4 sm:px-8 lg:px-12 pt-20 sm:pt-24 py-6 pb-24 max-w-7xl mx-auto safe-bottom">
      <TopDock activeTab={activeTab} onTabChange={setActiveTab} alertCount={3} />

      {/* Header */}
      <header className="flex items-start justify-between gap-3 mb-8 sm:mb-10 animate-fade-in">
        <div className="min-w-0">
          <p className="text-soft text-xs sm:text-sm mb-1">Good evening</p>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight truncate">
            Kathir <span className="text-soft font-light">·</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ml-2">Smart Fridge</span>
          </h1>
        </div>
        <WeatherWidget />
      </header>

      {/* Tab Content */}
      {activeTab === "dashboard" && <DashboardView />}
      {activeTab === "notifications" && <NotificationsView />}
      {activeTab === "voice" && <VoiceAssistantView />}
      {activeTab === "touchscreen" && <TouchscreenView />}
      {activeTab === "settings" && <SettingsView />}

      <InstallPrompt />
    </main>
  );
};

export default Index;
