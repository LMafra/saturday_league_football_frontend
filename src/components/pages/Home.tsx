import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChartLine, FaRobot, FaTrophy } from "react-icons/fa";

const Home = () => {
  const features = [
    {
      icon: <FaChartLine className="w-8 h-8 mb-4 text-blue-600" />,
      title: "Estatísticas Detalhadas",
      description:
        "Dados específicos como gols, assistências e desempenho individual com visualizações temporais personalizadas.",
    },
    {
      icon: <FaRobot className="w-8 h-8 mb-4 text-green-600" />,
      title: "Automação Inteligente",
      description:
        "Algoritmos que organizam rodadas automaticamente, equilibrando times com base em habilidades e frequência.",
    },
    {
      icon: <FaTrophy className="w-8 h-8 mb-4 text-yellow-600" />,
      title: "Histórico Competitivo",
      description:
        "Rankings atualizados e conquistas históricas para promover competição saudável entre jogadores.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              Transforme Suas
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Peladas
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Organize, analise e evolua suas peladas com ferramentas
              profissionais de forma simples e intuitiva
            </p>
            <Link to="/championships">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Comece Agora Gratuitamente
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-16">
            <span className="border-b-4 border-blue-500 pb-2">
              Vantagens Exclusivas
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="text-center">
                  {feature.icon}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="py-16 bg-slate-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-3xl font-bold text-white mb-6">
            Pronto para revolucionar suas peladas?
          </h3>
          <Link to="/championships">
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
              <FaTrophy className="w-5 h-5" />
              Comece Agora
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
