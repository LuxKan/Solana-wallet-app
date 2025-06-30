import React, { FC, useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import WalletConnect from './components/WalletConnect';
import './App.css';
import DemoWallets from './components/DemoWallets';
require('@solana/wallet-adapter-react-ui/styles.css');

// Use .env for QuickNode endpoints
const QUICKNODE_MAINNET_URL = "https://fragrant-maximum-snowflake.solana-mainnet.quiknode.pro/f99e0423a2334f9723ba030f4d1a8f237770fd8e"

const App: FC = () => {
  const networkOptions = [
    { label: 'Devnet', value: WalletAdapterNetwork.Devnet, icon: '🧪', tooltip: 'Solana Devnet: For development and testing' },
    { label: 'Testnet', value: WalletAdapterNetwork.Testnet, icon: '🛠️', tooltip: 'Solana Testnet: For pre-production testing' },
    { label: 'Mainnet', value: WalletAdapterNetwork.Mainnet, icon: '🌐', tooltip: 'Solana Mainnet: Real network with real assets' },
  ];
  const [selectedNetwork, setSelectedNetwork] = useState<WalletAdapterNetwork>(() => {
    return (localStorage.getItem('solana-network') as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;
  });
  const endpoint = useMemo(() => {
    if (selectedNetwork === WalletAdapterNetwork.Mainnet && QUICKNODE_MAINNET_URL) {
      return QUICKNODE_MAINNET_URL;
    }

    return clusterApiUrl(selectedNetwork);
  }, [selectedNetwork]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { connected } = useWallet();

  useEffect(() => {
    if (!document.body.classList.contains('dark-mode')) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('solana-network', selectedNetwork);
  }, [selectedNetwork]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [selectedNetwork]
  );

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="app-background">
              <div className="gradient-sphere sphere-1"></div>
              <div className="gradient-sphere sphere-2"></div>
              <div className="gradient-sphere sphere-3"></div>
            </div>

            <nav className="app-nav">
              <div className="nav-content">
                <div className="nav-left">
                  <div className="logo-container">
                    <span className="logo-icon">⚡</span>
                    <h1 className="app-title">Solana Wallet</h1>
                  </div>
                  <div className="network-badge">
                    <span className="network-dot"></span>
                    {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}
                  </div>
                  <select
                    className="network-selector"
                    value={selectedNetwork}
                    onChange={e => setSelectedNetwork(e.target.value as WalletAdapterNetwork)}
                  >
                    {networkOptions.map(option => (
                      <option
                        key={option.value}
                        value={option.value}
                        title={option.tooltip}
                      >
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="nav-right">
                  <button 
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </button>
                </div>
              </div>
            </nav>
            
            <main className="app-main">
              <div className="wallet-section">
                <div className="wallet-header">
                  <h2 className="section-title">Welcome to Solana</h2>
                  <p className="section-description">
                    Connect your wallet to start exploring the Solana ecosystem
                  </p>
                </div>
                {!connected && (
                  <div className="wallet-features">
                    <div className="feature-item">
                      <div className="feature-icon-wrapper">
                        <span className="feature-icon">🔒</span>
                      </div>
                      <div className="feature-content">
                        <h3>Secure Connection</h3>
                        <p>Enterprise-grade security for your assets</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon-wrapper">
                        <span className="feature-icon">⚡</span>
                      </div>
                      <div className="feature-content">
                        <h3>Lightning Fast</h3>
                        <p>Instant transactions on Solana network</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon-wrapper">
                        <span className="feature-icon">🌐</span>
                      </div>
                      <div className="feature-content">
                        <h3>Devnet Ready</h3>
                        <p>Test and develop with confidence</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="wallet-connect-container">
                  <WalletConnect endpoint={endpoint} />
                  <DemoWallets endpoint={endpoint} />
                </div>
              </div>
            </main>

            <footer className="app-footer">
              <div className="footer-content">
                <div className="footer-brand">
                  <span className="footer-logo">⚡</span>
                  <p>Powered by Solana Web3.js</p>
                </div>
                <div className="footer-links">
                  <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                    <span className="link-icon">🌐</span>
                    Solana
                  </a>
                  <a href="https://docs.solana.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                    <span className="link-icon">📚</span>
                    Documentation
                  </a>
                  <a href="https://github.com/solana-labs" target="_blank" rel="noopener noreferrer" className="footer-link">
                    <span className="link-icon">💻</span>
                    GitHub
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App; 