import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';

import './assets/styles/global.scss';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './components/pages/Home';
import Championships from './components/pages/championships/Championships';
import Championship from './components/pages/championships/Championship';
import Round from './components/pages/rounds/Round';

const App = () => {
  return (
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/championships" element={<Championships />} />
            <Route path="/championships/:id" element={<Championship />} />
            <Route path="/rounds/:id" element={<Round />} />
          </Routes>
        </main>
        <Footer />
      </Router>
  );
};

export default App;
