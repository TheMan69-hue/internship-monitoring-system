import Dashboard from './components/Dashboard/Dashboard'
import { studentProfile } from './data/studentProfile'

function App() {
  return <Dashboard studentProfile={studentProfile} />
}

export default App
