import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuditProvider, useAudit } from './context/AuditContext';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import AuditDashboard from './pages/AuditDashboard';
import OverallDashboard from './pages/OverallDashboard';
import SiteStructure from './pages/SiteStructure';
import PageDetails from './pages/PageDetails';
import BeforeAfter from './pages/BeforeAfter';
import PersonaAnalysis from './pages/PersonaAnalysis';
import BusinessImpact from './pages/BusinessImpact';
import TopImprovements from './pages/TopImprovements';
import AICoach from './pages/AICoach';
import ProgressTracker from './pages/ProgressTracker';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const AppContent: React.FC = () => {
  const { activeTab } = useAudit();

  const renderPage = () => {
    switch (activeTab) {
      case 'landing':     return <LandingPage />;
      case 'auditor':     return <AuditDashboard />;
      case 'overall':     return <OverallDashboard />;
      case 'structure':   return <SiteStructure />;
      case 'details':     return <PageDetails />;
      case 'beforeafter': return <BeforeAfter />;
      case 'personas':    return <PersonaAnalysis />;
      case 'business':    return <BusinessImpact />;
      case 'topfixes':    return <TopImprovements />;
      case 'coach':       return <AICoach />;
      case 'progress':    return <ProgressTracker />;
      default:            return <LandingPage />;
    }
  };

  const isLanding = activeTab === 'landing';

  return (
    <div className="flex h-screen overflow-hidden">
      {!isLanding && <Sidebar />}
      <main
        className={`flex-1 overflow-y-auto ${isLanding ? 'w-full' : ''}`}
        style={activeTab === 'coach' ? { display: 'flex', flexDirection: 'column' } : {}}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuditProvider>
      <AppContent />
    </AuditProvider>
  );
}

export default App;
