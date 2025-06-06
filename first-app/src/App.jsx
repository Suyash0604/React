import React, { useState } from "react";
import Create from './Components/Create.jsx';
import Read from './Components/Read.jsx';

const App = () => {
  const [tasks, setTasks] = useState([]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-indigo-400 drop-shadow">
        Task Manager
      </h1>
      <div className="w-full max-w-md space-y-10">
        <Create tasks={tasks} setTasks={setTasks} />
        <Read tasks={tasks} setTasks={setTasks} />
      </div>
    </div>
  );
};

export default App;
