import ArchitectureDiagram from './components/ArchitectureDiagram'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>仕事一元管理アプリ — アーキテクチャ図</h1>
      </header>
      <main className="app-main">
        <ArchitectureDiagram />
      </main>
    </div>
  )
}

export default App
