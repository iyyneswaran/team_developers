import React from 'react';
import './App.css';
// import Chat from './ChatPage/Chat';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './HomePage/Home';
import Profile from './Profile/Profile';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Chat from './ChatPage/Chat';
import Analysis from './Analysis/Analysis';
import Weather from './Weather/Weather';
import Schemes from './Schemes/Schemes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Landingpage />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* admin */}
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
