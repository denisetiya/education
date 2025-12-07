import React from 'react';
import { Users, AlertCircle, CheckCircle, Server } from 'lucide-react';

export const AdminOverview: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>System Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Total Users" value="1,248" sub="12 new today" icon={<Users size={24} color="#3b82f6" />} />
                <StatCard title="Active Sessions" value="142" sub="Currently online" icon={<Server size={24} color="#10b981" />} />
                <StatCard title="System Health" value="98.9%" sub="All systems operational" icon={<CheckCircle size={24} color="#8b5cf6" />} />
                <StatCard title="Pending Reports" value="5" sub="Requires attention" icon={<AlertCircle size={24} color="#f59e0b" />} />
            </div>

            <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Latest System Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { event: 'User Registration Spying', time: '10 mins ago', type: 'info' },
                        { event: 'Database Backup Completed', time: '1 hour ago', type: 'success' },
                        { event: 'High CPU Usage Alert', time: '2 hours ago', type: 'warning' },
                    ].map((e, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
                            <span style={{ fontWeight: '500' }}>{e.event}</span>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{e.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, sub, icon }: any) => (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>{title}</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0.2rem 0' }}>{value}</h3>
            <p style={{ color: '#10b981', fontSize: '0.8rem' }}>{sub}</p>
        </div>
        <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
            {icon}
        </div>
    </div>
);
