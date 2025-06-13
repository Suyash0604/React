import React from 'react';
import { toast } from 'react-toastify';

const Read = ({ tasks, setTasks }) => {
  const deleteHandler = (id) => {
    const newArr = tasks.filter((task) => task.id !== id);
    setTasks(newArr);
    toast.error("To Do deleted")
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl backdrop-blur-md border border-gray-700">
      <h2 className="text-xl font-semibold text-indigo-300 mb-4">Pending Tasks</h2>
      <ol className="list-decimal list-inside space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center bg-gray-900 text-white p-3 rounded-lg"
          >
            <span>{task.title}</span>
            <button
              onClick={() => deleteHandler(task.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
            >
              Delete
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Read;
  