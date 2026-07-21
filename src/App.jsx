import { useState, useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parseKnowledge } from './utils/parseKnowledge'
import knowledgeMd from './data/knowledge.md?raw'
import './index.css'

function App() {
  const [modules, setModules] = useState([])
  const [activeModule, setActiveModule] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [search, setSearch] = useState('')
  const contentRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    const parsed = parseKnowledge(knowledgeMd)
    setModules(parsed)
  }, [])

  const totalSections = modules.reduce((acc, m) => acc + m.sections.length, 0)
  const moduleIndex = activeModule ? modules.findIndex(m => m.id === activeModule.id) : -1
  const progress = activeModule ? Math.round(((moduleIndex + 1) / modules.length) * 100) : 0

  const filteredModules = useMemo(() => {
    if (!search.trim()) return modules
    const q = search.toLowerCase()
    return modules.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.sections.some(s => s.title.toLowerCase().includes(q))
    )
  }, [modules, search])

  function openModule(mod) {
    setSearch('')
    setActiveModule(mod)
    setActiveSection(mod.sections[0]?.id || null)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToSection(secId) {
    setActiveSection(secId)
    setSidebarOpen(false)
    const el = document.getElementById('sec-' + secId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function goToIndex() {
    setSearch('')
    setActiveModule(null)
    setActiveSection(null)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null
  const nextModule = moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : null

  useEffect(() => {
    function handleKey(e) {
      if (!activeModule) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft' && prevModule) { openModule(prevModule); e.preventDefault() }
      if (e.key === 'ArrowRight' && nextModule) { openModule(nextModule); e.preventDefault() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeModule, prevModule, nextModule])

  return (
    <div className="app-layout">
      <header className="app-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>☰</button>
        <button onClick={goToIndex} className="header-logo-btn">
          <span className="logo-q">Q</span>
          <span className="logo-text">uarkus Guide</span>
        </button>
        <div className="header-sep" />
        <span className="header-subtitle">Spring → Quarkus</span>
        <div className="header-right">
          <button className="theme-btn" onClick={toggleTheme} title="Alternar tema">{theme === 'light' ? '🌙' : '☀️'}</button>
          <span className="spring-badge">⚡ Para devs Spring</span>
          <button className="back-hub-btn" onClick={() => window.location.href = 'https://hugosergio.com.br/guide/'}>← Guia Hub</button>
        </div>
      </header>

      <div className="app-body">
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-inner">
            <div className="progress-wrap">
              <div className="progress-label">
                {activeModule ? `Módulo ${moduleIndex + 1}/${modules.length} · ${progress}%` : `${modules.length} módulos`}
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: progress + '%' }} />
              </div>
            </div>

            <div className="search-wrap">
              <input
                className="search-input"
                type="text"
                placeholder="Buscar módulo…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="sidebar-label">{filteredModules.length} módulo{filteredModules.length !== 1 ? 's' : ''}</div>

            <button className="mod-btn" onClick={goToIndex}>
              <div className={`mod-header ${!activeModule && !search ? 'active' : ''}`}>
                <span className="mod-num">⌂</span>
                <span className="mod-title">Início</span>
              </div>
            </button>

            {filteredModules.map((mod, i) => {
              const isActive = activeModule?.id === mod.id
              const realIndex = modules.findIndex(m => m.id === mod.id)
              return (
                <div key={mod.id}>
                  <button className="mod-btn" onClick={() => openModule(mod)}>
                    <div className={`mod-header ${isActive ? 'active' : ''}`}>
                      <span className="mod-num">{String(realIndex + 1).padStart(2, '0')}</span>
                      <span className="mod-title">{mod.title.replace(/Módulo \d+: /, '')}</span>
                    </div>
                  </button>
                  {isActive && mod.sections.length > 0 && (
                    <div className="sec-list">
                      {mod.sections.map(sec => (
                        <button
                          key={sec.id}
                          className={`sec-btn ${activeSection === sec.id ? 'active' : ''}`}
                          onClick={() => goToSection(sec.id)}
                        >
                          {sec.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {filteredModules.length === 0 && (
              <div className="search-empty">Nenhum módulo encontrado</div>
            )}
          </div>
        </aside>

        <main className="content-area" ref={contentRef}>
          {!activeModule ? (
            <WelcomeScreen modules={modules} totalSections={totalSections} onOpen={openModule} />
          ) : (
            <div className="content-inner" key={activeModule.id}>
              <div className="mod-eyebrow">
                Módulo {moduleIndex + 1} de {modules.length}
                <span className="kbd-hint">← → para navegar</span>
              </div>
              <h1 className="mod-title-h1">
                {activeModule.title.replace(/Módulo \d+: /, '')}
              </h1>

              {activeModule.sections.map(sec => (
                <div key={sec.id} className="section-block" id={`sec-${sec.id}`}>
                  <h3 className="section-title-h3">{sec.title}</h3>
                  <div className="md">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {sec.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              <div className="mod-nav-arrows">
                {prevModule ? (
                  <button className="arrow-btn" onClick={() => openModule(prevModule)}>
                    ← <div><span className="arrow-lbl">Anterior</span>{prevModule.title.replace(/Módulo \d+: /, '')}</div>
                  </button>
                ) : <div style={{flex:1}} />}
                {nextModule && (
                  <button className="arrow-btn right" onClick={() => openModule(nextModule)}>
                    <div><span className="arrow-lbl">Próximo</span>{nextModule.title.replace(/Módulo \d+: /, '')}</div> →
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function WelcomeScreen({ modules, totalSections, onOpen }) {
  const [welSearch, setWelSearch] = useState('')

  const filtered = welSearch.trim()
    ? modules.filter(m =>
        m.title.toLowerCase().includes(welSearch.toLowerCase()) ||
        m.sections.some(s => s.title.toLowerCase().includes(welSearch.toLowerCase()))
      )
    : modules

  return (
    <div className="welcome">
      <div className="welcome-tag">// Guia de Estudos</div>
      <h1 className="welcome-h1">
        Do Spring para o <span>Quarkus</span>
      </h1>
      <p className="welcome-sub">
        Um guia prático para desenvolvedores Spring que querem dominar o Quarkus.
        Aproveite seu conhecimento existente e faça a transição de forma natural.
      </p>
      <div className="welcome-btns">
        <button className="btn-primary" onClick={() => modules[0] && onOpen(modules[0])}>
          Começar agora →
        </button>
      </div>

      <div className="stats-bar">
        <div><div className="stat-val">{modules.length}</div><div className="stat-lbl">Módulos</div></div>
        <div><div className="stat-val">{totalSections}</div><div className="stat-lbl">Tópicos</div></div>
        <div><div className="stat-val">JVM</div><div className="stat-lbl">+ Native</div></div>
        <div><div className="stat-val">3.x</div><div className="stat-lbl">Quarkus versão</div></div>
      </div>

      <div className="welcome-search">
        <input
          className="search-input wel-search-input"
          type="text"
          placeholder="Buscar módulo…"
          value={welSearch}
          onChange={e => setWelSearch(e.target.value)}
        />
      </div>

      <div className="modules-grid">
        {filtered.map((mod, i) => {
          const realIndex = modules.findIndex(m => m.id === mod.id)
          return (
            <div key={mod.id} className="module-card" onClick={() => onOpen(mod)}>
              <div className="card-num">Módulo {String(realIndex + 1).padStart(2, '0')}</div>
              <div className="card-title">{mod.title.replace(/Módulo \d+: /, '')}</div>
              <div className="card-count">{mod.sections.length} tópico{mod.sections.length !== 1 ? 's' : ''}</div>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="search-empty">Nenhum módulo encontrado</div>}
      </div>
    </div>
  )
}

export default App
