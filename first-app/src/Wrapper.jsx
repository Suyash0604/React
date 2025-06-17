import React, { createContext, useState } from 'react'

export const todoContext = createContext(null);

const Wrapper = (props) => {
  const [tasks, setTasks] = useState([]);
    
  return <todoContext.Provider value={[tasks,setTasks]}>
    {props.children}
  </todoContext.Provider>;
   
  
}

export default Wrapper  