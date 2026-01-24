import { useState } from 'react';
import { Box } from '@mui/material';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import ConsumerDashboard from './pages/ConsumerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'signin' | 'dashboard'>('landing');
  const [userRole, setUserRole] = useState<'consumer' | 'worker'>('consumer');

  const handleLaunchApp = () => {
    setCurrentView('signin');
  };

  const handleSignIn = () => {
    setCurrentView('dashboard');
  };

  const handleRoleSwitch = () => {
    setUserRole(prev => prev === 'consumer' ? 'worker' : 'consumer');
  };

  const handleLogout = () => {
    setCurrentView('landing');
    setUserRole('consumer');
  };

  return (
    <Box>
      {currentView === 'landing' && <Landing onLaunchApp={handleLaunchApp} />}
      {currentView === 'signin' && <SignIn onSignIn={handleSignIn} />}
      {currentView === 'dashboard' && userRole === 'consumer' && (
        <ConsumerDashboard onRoleSwitch={handleRoleSwitch} onLogout={handleLogout} />
      )}
      {currentView === 'dashboard' && userRole === 'worker' && (
        <WorkerDashboard onRoleSwitch={handleRoleSwitch} onLogout={handleLogout} />
      )}
    </Box>
  );
}
