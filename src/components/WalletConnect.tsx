import React, { FC, useEffect, useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

interface WalletConnectProps {
  endpoint: string;
}

const WalletConnect: FC<WalletConnectProps> = ({ endpoint }) => {
  const { publicKey, connected, sendTransaction } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<NodeJS.Timeout | null>(null);

  const connection = new Connection(endpoint, 'confirmed');

  const fetchBalance = async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (err: any) {
      if (err && err.message && err.message.includes('429')) {
        setError('Too many requests. Please wait a few seconds and try again.');
      } else if (err && err.message && err.message.includes('403')) {
        setError('Access forbidden. Please check your RPC endpoint or try again later.');
      } else {
        setError('Failed to fetch balance. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!publicKey) return;
    fetchBalance();
    // Remove onAccountChange to reduce request frequency
    // Only fetch on mount, network change, or manual refresh
    // eslint-disable-next-line
  }, [publicKey, endpoint]);

  const handleSend = async () => {
    if (!publicKey || !recipientAddress || !amount) return;
    setSending(true);
    setError(null);
    setNotification(null);
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      await fetchBalance();
      setRecipientAddress('');
      setAmount('');
      setNotification('✅ Transaction successful!');
      if (notificationRef.current) clearTimeout(notificationRef.current);
      notificationRef.current = setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      setError('Failed to send transaction. Please try again.');
      console.error('Error sending transaction:', error);
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    if (cooldown) return;
    setCooldown(true);
    await fetchBalance();
    cooldownRef.current = setTimeout(() => setCooldown(false), 5000);
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      if (notificationRef.current) clearTimeout(notificationRef.current);
    };
  }, []);

  return (
    <div className="wallet-container">
      <WalletMultiButton />
      <a
        href="https://netlify.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <button className="netlify-btn">
          Netlify Demo
        </button>
      </a>
      {connected && (
        <div className="wallet-info">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="wallet-info-title">Wallet Information</h2>
            <button className="refresh-btn" onClick={handleRefresh} disabled={loading || cooldown} title="Refresh wallet info">
              🔄 {loading ? 'Refreshing...' : cooldown ? 'Wait...' : 'Refresh'}
            </button>
          </div>
          {error && <div className="wallet-error">{error}</div>}
          {notification && <div className="wallet-notification">{notification}</div>}
          <div className="wallet-info-details">
            <div className="wallet-info-row">
              <span className="wallet-info-label">Public Key:</span>
              <span className="wallet-info-value">{publicKey?.toString()}</span>
            </div>
            <div className="wallet-info-row">
              <span className="wallet-info-label">Balance:</span>
              <span className="wallet-info-value">{balance !== null ? `${balance} SOL` : 'Loading...'}</span>
            </div>
          </div>
          <div className="send-form">
            <h3 className="send-form-title">Send SOL</h3>
            <div className="send-form-fields">
              <input
                type="text"
                className="send-input"
                placeholder="Recipient Address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              <input
                type="number"
                className="send-input"
                placeholder="Amount (SOL)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button className="send-btn" onClick={handleSend} disabled={sending}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 