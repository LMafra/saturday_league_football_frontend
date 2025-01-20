import React from 'react';
import { Link } from 'react-router';

const Home = () => {
  return (
    <div className='section no-pad-bot no-pad-top'>
      <section className="hero-section">
        <div className="container center">
          <h2 className="white-text">Pelada Insights</h2>
          <h4 className="white-text light">
            Manage your games with ease. Simplify the way you organize and play.
          </h4>
          <Link to="/championships">
            <button className="btn-large">
                Crie uma Pelada
            </button>
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2 className='header center text_b'>Vantagens</h2>
          <div className="row">
            <div className="col s12 m4">
              <div className="card card-avatar small">
                <div className='card-content'>
                  <div className='card-title grey-text text-darken-4'>
                    <h5 className='center'>
                      Estatísticas Detalhadas e Personalizáveis
                    </h5>
                  </div>
                  <div className='card-image waves-effect waves-block waves-light'></div>
                  <p className='justify'>
                    Ofereça dados específicos, como gols marcados, assistências, cartões e desempenho de jogadores, com visualizações por períodos (mensal, trimestral, etc.).
                  </p>
                </div>
              </div>
            </div>
            <div className="col s12 m4">
              <div className="card card-avatar small">
                <div className='card-content'>
                  <div className='card-title grey-text text-darken-4'>
                    <h5 className='center'>
                      Automação de Rodadas e Campeonatos
                    </h5>
                  </div>
                  <p className='justify'>
                    Aplique algoritmos para organizar rodadas automaticamente, equilibrando times com base em habilidades, frequência dos jogadores e outros critérios personalizáveis.
                  </p>
                </div>
              </div>
            </div>
            <div className="col s12 m4">
              <div className="card card-avatar small">
                <div className='card-content'>
                  <div className='card-title grey-text text-darken-4'>
                    <h5 className='center'>
                      Histórico e Ranking de Jogadores
                    </h5>
                  </div>
                  <p className='justify'>
                    Mantenha o histórico completo de cada jogador, com rankings e conquistas ao longo do tempo, para promover engajamento e competitividade saudável.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
