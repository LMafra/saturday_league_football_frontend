import React from 'react';
import { FiGithub, FiMail, FiArrowUpRight } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Pelada Insights
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Transformando a gestão de peladas com tecnologia intuitiva e análises poderosas.
            </p>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#!"
                  className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                >
                  <FiArrowUpRight className="flex-shrink-0" />
                  <span>Recursos</span>
                </a>
              </li>
              <li>
                <a
                  href="#!"
                  className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                >
                  <FiArrowUpRight className="flex-shrink-0" />
                  <span>Documentação</span>
                </a>
              </li>
              <li>
                <a
                  href="#!"
                  className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                >
                  <FiArrowUpRight className="flex-shrink-0" />
                  <span>Política de Privacidade</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contato</h4>
            <div className="space-y-2">
              <a
                href="mailto:chagas.lucas.mafra@gmail.com"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <FiMail className="flex-shrink-0" />
                chagas.lucas.mafra@gmail.com
              </a>
              <a
                href="https://github.com/LMafra"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <FiGithub className="flex-shrink-0" />
                LMafra
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-slate-700 pt-8 text-center">
          <p className="text-slate-400">
            © {currentYear} Pelada Insights. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
