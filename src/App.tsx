import { BrowserRouter as Router, Routes, Route } from "react-router";

import "./assets/styles/global.scss";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./components/pages/Home";
import ChampionshipsPage from "./components/pages/championships/ChampionshipsPage";
import ChampionshipPage from "./components/pages/championships/ChampionshipPage";
import Round from "./components/pages/rounds/RoundPage";
import Match from "./components/pages/matches/MatchPage";
import Team from "./components/pages/teams/TeamPage";
import Player from "./components/pages/players/PlayerPage";

const App = () => {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/championships" element={<ChampionshipsPage />} />
          <Route path="/championships/:id" element={<ChampionshipPage />} />
          <Route path="/rounds/:id" element={<Round />} />
          <Route path="/matches/:id" element={<Match />} />
          <Route path="/players/:id" element={<Player />} />
          <Route path="/teams/:id" element={<Team />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
