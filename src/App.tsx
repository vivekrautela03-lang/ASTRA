import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { AstraLogin } from './components/astra/AstraLogin';
import { AstraAssistant } from './components/astra/AstraAssistant';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>({
    email: 'operator@astra.os',
    name: 'Operator'
  });

  return (
    <div className="relative w-full h-screen bg-[#000000] bg-pitch-black text-[#E6F7FF] overflow-hidden select-none">
      {currentUser ? (
        <Dashboard user={currentUser} onLogout={() => setCurrentUser(null)} />
      ) : (
        <AstraLogin onAuthenticate={(user) => setCurrentUser(user)} />
      )}

      {/* Global Floating Assistant Layer */}
      <AstraAssistant />
    </div>
  );
};

export default App;
