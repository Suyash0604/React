import React, { useState } from "react";
import { nanoid } from 'nanoid';

const Create = ({ tasks, setTasks }) => {
  const [title, setTitle] = useState("");

  const formHandler = (e) => {
    e.preventDefault();
    if (title.trim() === "") return;
    const newTask = { id: nanoid(), title: title.trim() };
    setTasks([...tasks, newTask]);
    setTitle("");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl backdrop-blur-md border border-gray-700">
      <h2 className="text-xl font-semibold text-indigo-300 mb-4">Create Task</h2>
      <form onSubmit={formHandler} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter title of the task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-900 text-white border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default Create;
