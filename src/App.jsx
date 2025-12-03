import { useState } from 'react'
import './App.css'
import { Navbar } from './components/Navbar.jsx'
import Header from './components/Header.jsx'
import About from './components/About.jsx'
import Category from './components/Category.jsx'
import Ratings from './components/Ratings.jsx'
import Team from './components/Team.jsx'
import Footer from './components/Footer.jsx'
function App() {


  return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Header />
        <About />
        <Category />
        <Ratings />
        <Team />
        <Footer />
      </div>
  )
}

export default App
