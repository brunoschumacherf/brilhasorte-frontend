import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/80 border-t border-[var(--border-color)] mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-[var(--text-secondary)]">
        <div className="flex justify-center gap-6 mb-4">
          <a href="/termos-de-uso.html" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[var(--primary-gold)]">Termos de Uso</a>
          <a href="/politica-de-privacidade.html" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[var(--primary-gold)]">Política de Privacidade</a>
          <Link to="/support" className="text-sm hover:text-[var(--primary-gold)]">Suporte</Link>
          <a href="/quem-somos.html" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[var(--primary-gold)]">Quem Somos</a>
        </div>
        <p className="text-xs">&copy; 2025 Raspou, levou. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;