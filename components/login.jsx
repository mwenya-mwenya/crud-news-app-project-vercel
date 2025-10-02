import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const LoginForm = ({ setToken, setUserName, activeForm, setActiveForm }) => {
  const API = '/api';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Toggle login form visibility based on shared state
  const showForm = activeForm === 'login'; 
  const openForm = () => setActiveForm('login');
  
  // Handle input changes for controlled form fields
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // Submit login credentials and store token if successful
  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await res.json();
    //Error handling depending on backend response
    if (data.error) {
      alert(data.error);
      return
    }
    // Set cookies for authentication and username
    if (data.accessToken != undefined) {
      setToken(data.accessToken);
      localStorage.setItem('access', data.accessToken);
    }

    if (data.username != undefined) {
      localStorage.setItem('userName', data.username);
    }
  }

  return (
    <div className="w-1/2 max-w-md mb-10">

      <AnimatePresence mode="wait">
        {!showForm ? (

          <motion.button
            key="loginButton"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}

            transition={{ duration: 0.3 }}
            className="w-full bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={openForm}
          >

            Login
          </motion.button>

        ) : (

          <motion.form
            key="loginForm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
            onSubmit={handleSubmit}
          >

            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                value={formData.email}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password" className="mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"

                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                value={formData.password}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </button>

          </motion.form>

        )}
      </AnimatePresence>
    </div>

  );

}
export default LoginForm;