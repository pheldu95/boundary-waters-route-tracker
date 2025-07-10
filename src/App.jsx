import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BoundaryWatersMap from './components/Map/BoundaryWatersMap'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="h-full">
      <BoundaryWatersMap />
    </div>
  )
}

export default App
