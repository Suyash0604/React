import React from 'react';
import Nav from './Components/Nav';
import Mainroutes from './routes/Mainroutes';

const App = () => {
  return (
    <div className="w-screen h-screen bg-[var(--color-darkest)] text-[var(--color-light)] px-[10%]">
      <Nav />
      <Mainroutes />
    </div>
  );
};

export default App;
