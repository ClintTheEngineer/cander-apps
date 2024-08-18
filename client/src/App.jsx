import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Constants } from './pages/Constants';
import { Register } from './pages/Register';
import { PrivateRoutes } from './components/PrivateRoutes';
import { AppList } from './components/AppList';
import PasswordManager from './pages/PasswordManager';

function App() {
  // eslint-disable-next-line no-unused-vars
  const [token, setToken] = useState('');


  return (
    <>
    <Router>
      <Routes>
      <Route path='/' exact element={<Home />} />
      <Route path='/register' element={<Register />} />  
      <Route path="*" element={<Navigate to="/" />} /> 
      <Route path='login' element={<Login setToken={setToken} appName={Constants.APP_NAME} />} />
      <Route path="/" element={<PrivateRoutes />}>
          <Route path="/profile" element={<AppList />} />
          <Route path='/password-manager' element={<PasswordManager />} />
          </Route>
      </Routes>
     
    </Router>
    </>
  )
}

export default App
