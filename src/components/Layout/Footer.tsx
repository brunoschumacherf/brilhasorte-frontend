import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => (
  <Link to="/games" className="inline-flex items-center gap-2 text-2xl font-bold text-white transition-transform hover:scale-105">
    <img src="/logo.png" alt="BrilhaSorte Logo" className="h-9 w-9" />
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">BrilhaSorte</span>
  </Link>
);

const SocialIcon = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
    <a href={href} aria-label={label} className="text-gray-400 hover:text-white transition-colors">
        {children}
    </a>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/80 backdrop-blur-md border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          
          <div className="space-y-4 md:col-span-2">
            <Logo />
            <p className="max-w-md text-gray-400">
              A sua sorte brilha aqui. Oferecemos uma experiência de jogo emocionante e segura. Jogue com responsabilidade.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider">Jogos</h3>
            <ul className="space-y-3">
              <li><Link to="/games" className="text-gray-400 hover:text-yellow-300 transition-colors">Raspadinha</Link></li>
              <li><Link to="/mines" className="text-gray-400 hover:text-yellow-300 transition-colors">Mines</Link></li>
              <li><Link to="/double" className="text-gray-400 hover:text-yellow-300 transition-colors">Double</Link></li>
              <li><Link to="/plinko" className="text-gray-400 hover:text-yellow-300 transition-colors">Plinko</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider">Empresa</h3>
            <ul className="space-y-3">
              <li><a href="/termos-de-uso.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-300 transition-colors">Termos de Uso</a></li>
              <li><a href="/politica-de-privacidade.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-300 transition-colors">Privacidade</a></li>
              <li><Link to="/support" className="text-gray-400 hover:text-yellow-300 transition-colors">Suporte</Link></li>
              <li><a href="/quem-somos.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-300 transition-colors">Quem Somos</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 order-2 sm:order-1 mt-4 sm:mt-0">
                &copy; 2025 BrilhaSorte. Todos os direitos reservados. Jogo destinado a maiores de 18 anos.
            </p>
            <div className="flex gap-4 order-1 sm:order-2">
                <SocialIcon href="#" label="Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.4 3.3 4.4s-1.4-.6-2.8-.9c-1.2 2.2-2.8 4.3-5.2 4.3s-5.5-2.1-5.5-6.1c0-4.4 3.3-6.6 6.6-6.6s4.4 1.1 4.4 1.1S17.5 4 15 4s-4.4 2.2-4.4 6.6c0 1.2.6 2.2 1.7 2.8s2.8.9 2.8.9l-1.1 2.2c-2.4-1.1-4.4-3.3-4.4-6.6s2.2-5.5 5.5-5.5 5.5 2.2 5.5 5.5c0 1.1-.2 2.2-.6 3.3l2.8-1.7s.5-2.2 1.1-3.3c.6-1.1 1.1-2.2 1.1-2.2s-.6.6-1.4 1.1z"/></svg>
                </SocialIcon>
                <SocialIcon href="#" label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </SocialIcon>
                <SocialIcon href="#" label="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </SocialIcon>
            </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
