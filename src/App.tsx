import "./config/walletProvider.js"


import { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import ConsumerDashboard from './pages/ConsumerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import {useFirebaseAuth} from "./hooks/useFirebaseAuth.js"
export default function App() {
  const {user, logout, loading: loadingAuth} = useFirebaseAuth()
  const [currentView, setCurrentView] = useState<'landing' | 'signin' | 'dashboard'>('landing');
  const [userRole, setUserRole] = useState<'consumer' | 'worker'>('consumer');

  const handleLaunchApp = () => {
    if (user) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('signin');
    }

  };

  // useEffect(() => {
  //   if (loadingAuth) return;
  //   if (user) {
  //     setCurrentView('dashboard');
  //   } else {
  //     setCurrentView('signin');
  //   }
  // }, [user, loadingAuth])
  

  const handleSignIn = () => {
    setCurrentView('dashboard');
  };

  const handleRoleSwitch = () => {
    setUserRole(prev => prev === 'consumer' ? 'worker' : 'consumer');
  };

  const handleLogout = () => {
    setCurrentView('landing');
    setUserRole('consumer');
    logout()
  };

  if (loadingAuth) return 
    (<Box display={"flex"} alignItems={"center"} justifyContent={"center"} margin={10}>
      <CircularProgress/>
    </Box>)

  return (
    <Box>
      {currentView === 'landing' && <Landing onLaunchApp={handleLaunchApp} />}
      {currentView === 'signin' && <SignIn onSignIn={handleSignIn} />}
      {currentView === 'dashboard' && userRole === 'consumer' && (
        <ConsumerDashboard onRoleSwitch={handleRoleSwitch} onLogout={handleLogout} user={user}/>
      )}
      {currentView === 'dashboard' && userRole === 'worker' && (
        <WorkerDashboard onRoleSwitch={handleRoleSwitch} onLogout={handleLogout} user={user}/>
      )}
    </Box>
  );
}
