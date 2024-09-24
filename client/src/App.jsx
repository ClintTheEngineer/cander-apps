import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Constants } from './pages/Constants';
import { Register } from './pages/Register';
import { PrivateRoutes } from './components/PrivateRoutes';
import { AppList } from './components/AppList';
import PasswordManager from './pages/PasswordManager';
import LandingPage from './pages/LandingPage';

function App() {
  // eslint-disable-next-line no-unused-vars
  const [token, setToken] = useState('');


  return (
    <>
    <Router>
      <Routes>
      <Route path='/' exact element={<LandingPage />} />
      <Route path='/register' element={<Register />} />  
      <Route path='/landing-page' element={<LandingPage />} /> 
      <Route path="*" element={<Navigate to="/" />} /> 
      <Route path='login' element={<Login setToken={setToken} appName={Constants.APP_NAME} />} />
      <Route element={<PrivateRoutes />}>
          <Route path="/apps-dashboard" element={<AppList />} />
          <Route path='/password-manager' element={<PasswordManager />} />
          </Route>
      </Routes>
     
    </Router>
    </>
  )
}

export default App
