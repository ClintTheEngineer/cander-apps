import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Constants } from './utils/Constants';
import { Register } from './pages/Register';
import { PrivateRoutes } from './components/PrivateRoutes';
import { AppList } from './components/AppList';
import { Profile } from './pages/Profile';
import PasswordManager from './pages/PasswordManager';
import LandingPage from './pages/LandingPage';

function App() {
  const [token, setToken] = useState('');


  return (
    <>
    <Router>
      <Routes>
      <Route path='/' exact element={<LandingPage />} />
      <Route path='/register' element={<Register />} />  
      <Route path="*" element={<Navigate to="/" />} /> 
      <Route path='login' element={<Login token={token} setToken={setToken} appName={Constants.APP_NAME} />} />
      <Route path='/profile' element={<Profile />} />
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
