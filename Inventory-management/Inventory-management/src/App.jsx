import React from 'react'

import Nav from './Components/Nav';
import Mainroutes from './routes/Mainroutes';
const App = () => {
  return (
    <div className='py-5  bg-zinc-700 w-screen min-h-screen'>
      <Nav/>
      <Mainroutes/>
    </div>
  )
}

export default App