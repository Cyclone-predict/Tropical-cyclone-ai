import { useState, useEffect } from 'react';
import { Wind, Activity, Map as MapIcon, History, Menu, X, Satellite, Search, Sun, Moon, User, Bell, ShieldAlert } from 'lucide-react';
import './App.css';

// Import Pages
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import MapPage from './pages/MapPage';
import Evolution from './pages/Evolution';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Theme Management
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const navigateTo = (page) => {
    setCurrentPage(page);
    closeSidebar();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity size={18} /> },
    { id: 'analysis', label: 'Satellite Analysis', icon: <Satellite size={18} /> },
    { id: 'map', label: 'Cyclone Tracking', icon: <MapIcon size={18} /> },
    { id: 'evolution', label: 'History & Evolution', icon: <History size={18} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <Wind className="brand-icon" size={24} strokeWidth={2.5} />
            <span className="tracking-tight uppercase">CycloneAI Labs</span>
          </div>
        </div>
        
        <nav className="nav-links">
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => navigateTo(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted uppercase">
            <ShieldAlert size={14} /> Telemetry
          </div>
          <div className="system-status">
            <span className="status-dot-animated"></span>
            <span className="font-mono text-xs">SYSTEM ONLINE</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="flex items-center gap-4">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="header-search hidden lg:flex">
              <Search size={16} />
              <input type="text" placeholder="Search cyclones, locations, or coordinates..." />
            </div>
          </div>
          
          <div className="header-actions">
            {isDemoMode && (
              <div className="demo-badge hidden sm:flex border border-warning/30 bg-warning/10 text-warning px-3 py-1.5 rounded-md font-mono text-xs uppercase shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                <span className="animate-pulse">●</span> DEMO MODE
              </div>
            )}
            <button 
              className="btn btn-secondary text-xs font-mono uppercase px-3 py-1.5"
              onClick={() => setIsDemoMode(!isDemoMode)}
              title="Toggle Live/Demo Backend"
            >
              Toggle API Mode
            </button>

            <div className="w-px h-6 bg-border-color mx-1 hidden sm:block"></div>

            <button className="icon-btn" onClick={toggleTheme} title="Toggle Light/Dark Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="icon-btn" title="Notifications">
              <Bell size={18} />
            </button>
            <button className="icon-btn" title="User Profile">
              <User size={18} />
            </button>
          </div>
        </header>

        <div className="content-area">
          {currentPage === 'dashboard' && <Dashboard isDemoMode={isDemoMode} navigateTo={navigateTo} />}
          {currentPage === 'analysis' && <Analysis isDemoMode={isDemoMode} />}
          {currentPage === 'map' && <MapPage isDemoMode={isDemoMode} />}
          {currentPage === 'evolution' && <Evolution isDemoMode={isDemoMode} />}
        </div>
      </main>
    </div>
  );
}

export default App;
