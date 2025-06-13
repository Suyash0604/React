import React, { useState } from "react";
import { nanoid } from 'nanoid';
import { useForm } from "react-hook-form"
import { toast } from "react-toastify";

const Create = ({ tasks, setTasks }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const formHandler = (data) => {
    data.id = nanoid();
    data.isCompleted = false;
    setTasks([...tasks,data]);
    toast.success("Todo Created!")
    reset();
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl backdrop-blur-md border border-gray-700">
      <h2 className="text-xl font-semibold text-indigo-300 mb-4">Create Task</h2>
      <form onSubmit={handleSubmit(formHandler)} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter title of the task"
          {...register("title", { required: "Task title is required",maxLength: 10 })}
          className="bg-gray-900 text-white border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors?.title?.message? <span className="text-red-400 font-xl">Title is required</span> :""}
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
