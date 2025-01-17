import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';

import './assets/styles/global.scss';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './components/pages/Home';
import Championships from './components/pages/championships/Championships';

const App = () => {
  return (
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/championships" element={<Championships />} />
          </Routes>
        </main>
        <Footer />
      </Router>
  );
};

export default App;
