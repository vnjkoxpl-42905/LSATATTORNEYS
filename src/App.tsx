import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuestionBankProvider } from "./contexts/QuestionBankContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Pages
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AcademyFoyer from "./pages/AcademyFoyer";
import Home from "./pages/Home";
import Drill from "./pages/Drill";
import WrongAnswerJournal from "./pages/WrongAnswerJournal";
import FlaggedQuestions from "./pages/FlaggedQuestions";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Classroom from "./pages/Classroom";
import CausationStation from "./pages/CausationStation";
import MainConclusionRole from "./pages/MainConclusionRole";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <UserSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ── Public route ───────────────────────────────────── */}
              <Route path="/auth" element={<Auth />} />

              {/* ── Protected: onboarding ──────────────────────────── */}
              <Route path="/onboarding" element={
                <ProtectedRoute><Onboarding /></ProtectedRoute>
              } />

              {/* ── Protected: foyer hub (no question bank needed) ─── */}
              <Route path="/foyer" element={
                <ProtectedRoute><AcademyFoyer /></ProtectedRoute>
              } />

              {/* ── Protected: all drill/content routes ────────────── */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <QuestionBankProvider>
                    <Routes>
                      <Route path="/"                           element={<Home />} />
                      <Route path="/drill"                      element={<Drill />} />
                      <Route path="/waj"                        element={<WrongAnswerJournal />} />
                      <Route path="/flagged"                    element={<FlaggedQuestions />} />
                      <Route path="/analytics"                  element={<Analytics />} />
                      <Route path="/profile"                    element={<Profile />} />
                      <Route path="/classroom"                  element={<Classroom />} />
                      <Route path="/schedule"                   element={<Schedule />} />
                      <Route path="/bootcamp/causation-station"     element={<CausationStation />} />
                      <Route path="/bootcamp/main-conclusion-role" element={<MainConclusionRole />} />
                      <Route path="*"                           element={<NotFound />} />
                    </Routes>
                  </QuestionBankProvider>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserSettingsProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
