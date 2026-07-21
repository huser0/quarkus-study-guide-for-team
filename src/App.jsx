import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parseKnowledge } from './utils/parseKnowledge'
import knowledgeMd from './data/knowledge.md?raw'
import './index.css'

const PROGRESS_KEY = 'quarkus-progress'
const LAST_MOD_KEY = 'quarkus-last-module'

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') } catch { return {} }
}

function App() {
  const [modules, setModules] = useState([])
  const [activeModule, setActiveModule] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [search, setSearch] = useState('')
  const [viewed, setViewed] = useState(loadProgress)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [expandedMods, setExpandedMods] = useState(() => {
    const lastId = localStorage.getItem(LAST_MOD_KEY)
    return lastId ? new Set([lastId]) : new Set()
  })
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
    const lastId = localStorage.getItem(LAST_MOD_KEY)
    if (lastId) {
      const m = parsed.find(p => p.id === lastId)
      if (m) { setActiveModule(m); setActiveSection(m.sections[0]?.id || null) }
    }
  }, [])

  const totalSections = modules.reduce((acc, m) => acc + m.sections.length, 0)
  const moduleIndex = activeModule ? modules.findIndex(m => m.id === activeModule.id) : -1
  const progress = activeModule ? Math.round(((moduleIndex + 1) / modules.length) * 100) : 0
  const viewedCount = Object.keys(viewed).length
  const totalViewedPct = totalSections ? Math.round((viewedCount / totalSections) * 100) : 0

  const filteredModules = useMemo(() => {
    if (!search.trim()) return modules
    const q = search.toLowerCase()
    return modules.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.sections.some(s => s.title.toLowerCase().includes(q))
    )
  }, [modules, search])

  function toggleExpanded(modId) {
    setExpandedMods(prev => {
      const next = new Set(prev)
      if (next.has(modId)) next.delete(modId)
      else next.add(modId)
      return next
    })
  }

  function markViewed(secId) {
    if (viewed[secId]) return
    const next = { ...viewed, [secId]: true }
    setViewed(next)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
  }

  function openModule(mod) {
    setSearch('')
    setActiveModule(mod)
    setActiveSection(mod.sections[0]?.id || null)
    setSidebarOpen(false)
    localStorage.setItem(LAST_MOD_KEY, mod.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToSection(secId) {
    setActiveSection(secId)
    setSidebarOpen(false)
    markViewed(secId)
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
      if (paletteOpen) return
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(true); return }
      if (!activeModule) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft' && prevModule) { openModule(prevModule); e.preventDefault() }
      if (e.key === 'ArrowRight' && nextModule) { openModule(nextModule); e.preventDefault() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeModule, prevModule, nextModule, paletteOpen])

  const currentSections = activeModule?.sections || []

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
          <button className="palette-btn" onClick={() => setPaletteOpen(true)} title="Buscar (⌘K)">⌘K</button>
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
                {activeModule
                  ? `Módulo ${moduleIndex + 1}/${modules.length} · ${progress}%`
                  : `${viewedCount}/${totalSections} tópicos vistos (${totalViewedPct}%)`}
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: activeModule ? progress + '%' : totalViewedPct + '%' }} />
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
              const expanded = expandedMods.has(mod.id)
              return (
                <div key={mod.id}>
                  <div className="mod-row">
                    <button className="mod-btn mod-open-btn" onClick={() => openModule(mod)}>
                      <div className={`mod-header ${isActive ? 'active' : ''}`}>
                        <span className="mod-num">{String(realIndex + 1).padStart(2, '0')}</span>
                        <span className="mod-title">{mod.title.replace(/Módulo \d+: /, '')}</span>
                      </div>
                    </button>
                    {mod.sections.length > 0 && (
                      <button className="mod-expand-btn" onClick={() => toggleExpanded(mod.id)}>
                        <span className={`mod-chevron ${expanded ? 'open' : ''}`}>▸</span>
                      </button>
                    )}
                  </div>
                  {expanded && mod.sections.length > 0 && (
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
            <WelcomeScreen modules={modules} totalSections={totalSections} totalViewed={viewedCount} onOpen={openModule} />
          ) : (
            <div className="content-wrap">
              <div className="content-inner" key={activeModule.id}>
                <div className="mod-eyebrow">
                  Módulo {moduleIndex + 1} de {modules.length}
                  <span className="kbd-hint">← → para navegar</span>
                </div>
                <h1 className="mod-title-h1">
                  {activeModule.title.replace(/Módulo \d+: /, '')}
                </h1>

                {currentSections.map(sec => {
                  const isViewed = !!viewed[sec.id]
                  return (
                    <div key={sec.id} className={`section-block ${isViewed ? 'viewed' : ''}`} id={`sec-${sec.id}`}>
                      <h3 className="section-title-h3">
                        <button className="section-view-btn" onClick={() => markViewed(sec.id)} title="Marcar como lido">
                          {isViewed ? '✓' : '○'}
                        </button>
                        {sec.title}
                      </h3>
                      <div className="md">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {sec.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )
                })}

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

              {currentSections.length > 0 && (
                <aside className="toc-sidebar">
                  <div className="toc-label">Nesta página</div>
                  {currentSections.map(sec => (
                    <button
                      key={sec.id}
                      className={`toc-item ${activeSection === sec.id ? 'active' : ''}`}
                      onClick={() => goToSection(sec.id)}
                    >
                      <span className={`toc-bullet ${viewed[sec.id] ? 'done' : ''}`} />
                      {sec.title}
                    </button>
                  ))}
                </aside>
              )}
            </div>
          )}
        </main>
      </div>

      {paletteOpen && (
        <CommandPalette modules={modules} onOpen={openModule} onClose={() => setPaletteOpen(false)} />
      )}
    </div>
  )
}

function CommandPalette({ modules, onOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef(null)

  const items = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    const result = []
    for (const mod of modules) {
      if (mod.title.toLowerCase().includes(q)) {
        result.push({ type: 'module', mod, label: mod.title.replace(/Módulo \d+: /, '') })
      }
      for (const sec of mod.sections) {
        if (sec.title.toLowerCase().includes(q)) {
          result.push({ type: 'section', mod, sec, label: sec.title + ` — ${mod.title.replace(/Módulo \d+: /, '')}` })
        }
      }
    }
    return result.slice(0, 20)
  }, [modules, query])

  useEffect(() => { setIdx(0) }, [query])

  useEffect(() => {
    inputRef.current?.focus()
    function handleKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, items.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && items[idx]) {
        const item = items[idx]
        if (item.type === 'section') {
          onOpen(item.mod)
          setTimeout(() => {
            const el = document.getElementById('sec-' + item.sec.id)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        } else {
          onOpen(item.mod)
        }
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [items, idx, onClose, onOpen])

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette-modal" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette-input"
          type="text"
          placeholder="Buscar módulos e tópicos…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="palette-results">
          {items.length === 0 && query.trim() && (
            <div className="palette-empty">Nenhum resultado para "{query}"</div>
          )}
          {items.map((item, i) => (
            <button
              key={item.type + '-' + (item.sec?.id || item.mod.id)}
              className={`palette-item ${i === idx ? 'focused' : ''}`}
              onMouseDown={() => {
                if (item.type === 'section') {
                  onOpen(item.mod)
                  setTimeout(() => {
                    const el = document.getElementById('sec-' + item.sec.id)
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 100)
                } else {
                  onOpen(item.mod)
                }
                onClose()
              }}
            >
              <span className="palette-type">{item.type === 'module' ? 'M' : 'S'}</span>
              <span className="palette-label">{item.label}</span>
            </button>
          ))}
        </div>
        {items.length > 0 && (
          <div className="palette-footer">
            <span>↑↓ navegar</span>
            <span>↵ abrir</span>
            <span>⎋ fechar</span>
          </div>
        )}
      </div>
    </div>
  )
}

function WelcomeScreen({ modules, totalSections, totalViewed, onOpen }) {
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
        <div><div className="stat-val">{totalViewed}</div><div className="stat-lbl">Vistos</div></div>
        <div><div className="stat-val">⌘K</div><div className="stat-lbl">Busca rápida</div></div>
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

function PreBlock({ children }) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef(null)
  const handleCopy = useCallback(() => {
    const text = codeRef.current?.textContent || ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])
  return (
    <div className="code-wrap">
      <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
        {copied ? 'Copiado' : 'Copiar'}
      </button>
      <pre ref={codeRef}>{children}</pre>
    </div>
  )
}

const mdComponents = {
  pre({ children }) {
    return <PreBlock>{children}</PreBlock>
  }
}

export default App
