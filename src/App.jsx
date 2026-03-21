import { useState } from 'react'
import './App.css'
import { Navbar } from './components/Navbar'
import Footer from './components/Footer'

function App() {

  return (
    <>
      <Navbar/>
      <div className='bg-blue-500'>Checking for imports</div>
      <Footer/>
    </>
  )
}

export default App
