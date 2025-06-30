import React, { useEffect, useState } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SignatureResult } from '@solana/web3.js';

interface DemoWalletsProps {
    endpoint: string;
}

const WALLET_ADDRESSES = [
    'ExnVLJszScgqxZa44UTdTNeaG9PjXVjNvx6xYNUDTDYb',
    '78y7pfJ4eJ9N6aL8h7dvUcfYk3Gw8hDe9G93QQHmiSiz',
    'FkXo6pwD4LzC2obupejhQdp3jHfABG2tXLyhXkXRCaA',
    '83NKMWJDHhULbD9s9baeSrFikdQMiRxfci6WgprhCeQE',
];

const DemoWallets: React.FC<DemoWalletsProps> = ({ endpoint }) => {
    const [balances, setBalances] = useState<(number | null)[]>(Array(WALLET_ADDRESSES.length).fill(null));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<string[]>([]);
    useEffect(() => {
        const connection = new Connection('https://fragrant-maximum-snowflake.solana-mainnet.quiknode.pro/f99e0423a2334f9723ba030f4d1a8f237770fd8e', 'confirmed');
        WALLET_ADDRESSES.forEach(address => {
            const publicKey = new PublicKey(address);

            // Listen for transactions on the wallet address
            connection.onSignature(
                publicKey.toBase58(),
                (signatureInfo: SignatureResult) => {
                    setNotifications(prevNotifications => [
                        ...prevNotifications,
                        `New transaction detected on wallet ${address}: ${signatureInfo}`,
                    ]);
                },

                'confirmed'
            );
        });

        const fetchBalances = async () => {
            setLoading(true);
            setError(null);
            try {
                const connection = new Connection(endpoint, 'confirmed');
                const results = await Promise.all(
                    WALLET_ADDRESSES.map(async (address) => {
                        try {
                            const balance = await connection.getBalance(new PublicKey(address));
                            return balance / LAMPORTS_PER_SOL;
                        } catch {
                            return null;
                        }
                    })
                );
                setBalances(results);
            } catch (e) {
                setError('Failed to fetch balances.');
            } finally {
                setLoading(false);
            }
        };
        fetchBalances();
    }, [endpoint]);
    useEffect(() => {
        const connection = new Connection('https://fragrant-maximum-snowflake.solana-mainnet.quiknode.pro/f99e0423a2334f9723ba030f4d1a8f237770fd8e', 'confirmed');
        const subscriptionIds: number[] = [];

        WALLET_ADDRESSES.forEach(address => {
            const publicKey = new PublicKey(address);

            // Subscribe to confirmed signatures for the address
            const subscriptionId = connection.onLogs(publicKey, (logInfo) => {
                setNotifications(prev => [
                    ...prev,
                    `New transaction detected on wallet ${address}: signature ${logInfo.signature}`
                ]);
            }, 'confirmed');
            console.log(notifications)
            subscriptionIds.push(subscriptionId);
        });

        // Cleanup subscriptions
        return () => {
            subscriptionIds.forEach(id => {
                connection.removeOnLogsListener(id);
            });
        };
    }, []);
    return (
        <div className="demo-wallets" style={{ margin: '24px 0', padding: '16px', background: '#181c24', borderRadius: '8px' }}>
            <h3 style={{ color: '#00ad9f' }}>Demo Wallet Balances</h3>
            {loading && <div>Loading balances...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {WALLET_ADDRESSES.map((address, idx) => (
                    <li key={address} style={{ margin: '12px 0', color: '#fff' }}>
                        <span style={{ fontFamily: 'monospace' }}>{address}</span>
                        <br />
                        <span>Balance: {balances[idx] !== null ? `${balances[idx]} SOL` : 'Error or not found'}</span>
                    </li>
                ))}
            </ul>
            <div style={{ padding: '20px' }}>
                <h1>Solana Transaction Notifications</h1>
                <ul>
                    {notifications.map((notification, index) => (
                        <li key={index}>{notification}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DemoWallets;