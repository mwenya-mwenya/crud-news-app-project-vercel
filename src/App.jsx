// App.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RegisterForm from '../components/registration';
import LoginForm from '../components/login';
import './index.css';
import React, { useRef } from 'react';

const API = '/api';

export default function App() {
    // Track which form is currently active ('login', 'register', or null)
  const [activeForm, setActiveForm] = useState(null);

  // Store articles marked as read
  const [readArticles, setReadArticles] = useState([]);

  // Store fetched news articles
  const [news, setNews] = useState([]);

  // Store logged-in user's name
  const [userName, setUserName] = useState('');

  // Track the longest headline for layout measurement
  const [longestItem, setLongestItem] = useState(null);

  // JWT token for authentication
  const [token, setToken] = useState(localStorage.getItem('access'));

  // Logout: clear session and reset state
  async function handleLogout() {
    localStorage.removeItem('access');
    localStorage.removeItem('userName');
    setUserName('');
    setToken(null);
    setNews([]);
  }

  // Fetch news from backend and store locally
  async function loadNews() {
    console.log(token)
    const res = await fetch(`${API}/news`, { headers: { authorization: `Bearer ${token}` } });
    const data = await res.json();

    // Find longest headline for layout sizing
    const longest = data.items?.reduce((a, b) =>
      a.title.length > b.title.length ? a : b
    );
    
    // Assign unique IDs to each article
    const dataWithIds = data.items.map(item => ({
      ...item,
      id: crypto.randomUUID()
    }));

    setLongestItem(longest);
    setNews(dataWithIds || []);
    setUserName(localStorage.getItem('userName'));
    localStorage.setItem('news', JSON.stringify(dataWithIds));
  }

  // Track which article summary is expanded
  const [expandedIndex, setExpandedIndex] = useState(null);

  function toggleSummary(i) {
    setExpandedIndex(prev => (prev === i ? null : i));
  }

  function showAllArticles() {
    setReadArticles(() => []);
    localStorage.removeItem('readArticles');
  }

  // Load news from localStorage or fetch if missing
  useEffect(() => {
    if (token) {
      const storedNews = localStorage.getItem('news');
      if (storedNews) {
        setNews(JSON.parse(storedNews));
        setUserName(localStorage.getItem('userName'));
      } else {
        loadNews();

      }
    }
  }, [token]);
  
  // Ref to measure longest headline width | to be implemented
  const measureRef = useRef(null);

  useEffect(() => {
    if (measureRef.current) {
      const width = measureRef.current.offsetWidth;
    }
  }, [longestItem]);

  // Store articles locally
  useEffect(() => {
    localStorage.setItem('readArticles', JSON.stringify(readArticles));
  }, [readArticles]);

  // Get locally stored articles
  useEffect(() => {
    const stored = localStorage.getItem('readArticles');
    if (stored) {
      setReadArticles(JSON.parse(stored));
    }
  }, []);

  return (

    <div className="h-screen flex items-center justify-center">

      {/* Invisible span to measure longest headline width */}
      <span ref={measureRef} className="absolute invisible whitespace-nowrap">
        {longestItem?.title}
      </span>

      {/* Show login/register forms if not authenticated */}
      {!token && (<div className="h-[20vh] w-full max-w-md bg-gray-200 p-4 flex flex-col items-center justify-evenly">
        <RegisterForm 
          setToken={setToken} 
          setUserName={setUserName}
          activeForm={activeForm}
          setActiveForm={setActiveForm}            
           />
        <LoginForm 
        setToken={setToken} 
        setUserName={setUserName}
        activeForm={activeForm}
        setActiveForm={setActiveForm}
        />
      </div>)
      }
      {/* Show news feed if authenticated */} 
      {token && (
        <div className="relative h-screen w-full flex items-center justify-center">
          <div className="w-full max-w-3xl h-[90vh] overflow-y-auto px-4 pt-20">

            <div className="sticky flex justify-evenly w-full px-4">
              <button
                onClick={handleLogout}
                className="relative top-0 right-0 bg-red-500 text-white px-4 py-2 rounded hover:underline"
              >
                Logout
              </button>
              <button
                onClick={showAllArticles}
                className="relative text-sm text-gray-500 hover:underline"
              >
                Show read articles
              </button>
            </div>

            <h2 className="sticky top-0 bg-white z-10 text-xl font-semibold mb-4 text-center">
              Welcome{userName ? `, ${userName}` : ''}!
            </h2>

            <h1 className="text-2xl font-bold mb-6 text-center">Latest news</h1>
            <ul className="list-none flex flex-col items-center space-y-8">
              <AnimatePresence>
                {news
                  .filter(n => !readArticles.includes(n.id))
                  .map((n, i) => (

                    <motion.li
                      key={n.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="w-2/3 max-w-2xl border-none pb-4 mb-6"
                    >
                      <div className="flex justify-center pt-8">
                        <span className="text-sm text-gray-500"> {n.source}</span>
                      </div>
                      <button
                        onClick={() => toggleSummary(i)}
                        className="text-blue-600 hover:underline text-left w-full"
                      >
                        {n.title}
                      </button>
                      <button
                        onClick={() => setReadArticles(prev => [...prev, n.id])}
                        className="text-sm text-red-500 hover:underline mt-2"
                      >
                        Mark as read
                      </button>

                      {expandedIndex === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 'auto' }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 pl-4 text-gray-700"
                        >
                          <p>{n.summary || 'No summary available.'}</p>
                          <a
                            href={n.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline pb-8"
                          >
                            Read full article
                          </a>
                        </motion.div>
                      )}

                    </motion.li>
                  ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      )}

    </div>

  )
}
