import { useState, useEffect } from 'react'
import {
  Settings,
  User,
  Home,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Mail
} from 'lucide-react'
import './index.css'
import PostCard from './PostCard'
import EmailModal from './EmailModal'
import animeData from './data/anime_posts.json'

function App() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" or "likes"
  const [timeFilter, setTimeFilter] = useState("all"); // "all", "today", "week", "last_hour"
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // In a real app we'd fetch from an API, but here we import the JSON directly
    // since it was copied into our src/data directory
    if (animeData) {
      setPosts(animeData);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/refresh`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to refresh posts:", error);
      alert("Error refreshing data. Make sure the backend server is running.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter by Time
  const timeFilteredPosts = posts.filter(post => {
    if (timeFilter === "all") return true;

    // Created_utc is in seconds, Date.now() is in milliseconds
    const postTime = post.created_utc * 1000;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeFilter === "today") {
      return (now - postTime) <= oneDay;
    } else if (timeFilter === "week") {
      return (now - postTime) <= (7 * oneDay);
    } else if (timeFilter === "last_hour") {
      return (now - postTime) <= (60 * 60 * 1000); // 1 hr in ms
    }
    return true;
  });

  const sortedPosts = [...timeFilteredPosts].sort((a, b) => {
    if (sortBy === "likes") {
      return (b.score || 0) - (a.score || 0);
    } else {
      // newest
      return (b.created_utc || 0) - (a.created_utc || 0);
    }
  });

  const filteredPosts = sortedPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.selftext && post.selftext.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>A</div>
          AnimeDash
        </div>

        <div className="sidebar-navigation" style={{ marginTop: '2rem' }}>
          <div className={`nav-item ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>
            <Home size={20} />
            <span>All Posts</span>
          </div>
          <div className={`nav-item ${timeFilter === 'last_hour' ? 'active' : ''}`} onClick={() => setTimeFilter('last_hour')}>
            <Calendar size={20} />
            <span>Last Hour</span>
          </div>
          <div className={`nav-item ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>
            <User size={20} />
            <span>Today</span>
          </div>
          <div className={`nav-item ${timeFilter === 'week' ? 'active' : ''}`} onClick={() => setTimeFilter('week')}>
            <Briefcase size={20} />
            <span>Week</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
          <div className="nav-item" style={{ color: 'var(--text-secondary)' }}>
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="header-title">Recent Feed</h1>
            <p className="header-subtitle">Showing latest posts from r/anime</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid var(--border-glass)',
                padding: '0.75rem 1.2rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
                height: 'fit-content'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <Mail size={18} />
              Share Top 5 via Email
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--accent-blue)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.2rem',
                borderRadius: '20px',
                cursor: isRefreshing ? 'wait' : 'pointer',
                fontWeight: 600,
                opacity: isRefreshing ? 0.7 : 1,
                transition: 'opacity 0.2s',
                height: 'fit-content'
              }}
            >
              <svg
                style={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  width: '18px', height: '18px'
                }}
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh Posts'}
            </button>

            <div className="search-bar">
              <Search size={18} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="date-selector" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <ChevronLeft className="date-arrow" size={24} />
            <span>Showing: {filteredPosts.length} Posts</span>
            <ChevronRight className="date-arrow" size={24} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setSortBy('newest')}
              style={{
                background: sortBy === 'newest' ? 'rgba(75, 123, 255, 0.2)' : 'transparent',
                border: `1px solid ${sortBy === 'newest' ? 'var(--accent-blue)' : 'var(--border-glass)'}`,
                color: sortBy === 'newest' ? '#fff' : 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 500
              }}>
              Newest
            </button>
            <button
              onClick={() => setSortBy('likes')}
              style={{
                background: sortBy === 'likes' ? 'rgba(75, 123, 255, 0.2)' : 'transparent',
                border: `1px solid ${sortBy === 'likes' ? 'var(--accent-blue)' : 'var(--border-glass)'}`,
                color: sortBy === 'likes' ? '#fff' : 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 500
              }}>
              Most Likes
            </button>
          </div>
        </div>

        <div className="posts-grid">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <PostCard key={index} post={post} />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No posts found matching '{searchQuery}'
            </div>
          )}
        </div>
      </main>

      <EmailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

export default App
