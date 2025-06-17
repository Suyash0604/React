
import Create from './Components/Create.jsx';
import Read from './Components/Read.jsx';

const App = () => {
  

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-indigo-400 drop-shadow">
        Task Manager
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
        <Create/>
        <Read />
      </div>
    </div>
  );
};

export default App;
