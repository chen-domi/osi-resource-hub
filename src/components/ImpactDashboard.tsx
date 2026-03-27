import React from 'react';
import { Recycle, DollarSign, Leaf, Users } from 'lucide-react';

const metrics = [
  {
    icon: <Recycle size={22} />,
    value: '623 lbs',
    label: 'Waste Prevented',
    sub: '58% reduction vs. single-use',
    color: '#16a34a',
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
  },
  {
    icon: <DollarSign size={22} />,
    value: '$9,800',
    label: 'Cost Savings',
    sub: 'Across participating orgs',
    color: '#b45309',
    bg: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
  },
  {
    icon: <Leaf size={22} />,
    value: '1.8 tons',
    label: 'CO₂ Avoided',
    sub: 'Carbon footprint reduced',
    color: '#0891b2',
    bg: 'from-cyan-50 to-sky-50',
    border: 'border-cyan-200',
  },
  {
    icon: <Users size={22} />,
    value: '94/300+',
    label: 'Orgs Participating',
    sub: 'Active this semester',
    color: '#7c3aed',
    bg: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
  },
];

export default function ImpactDashboard() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((m) => (
        <div
          key={m.label}
          className={`bg-gradient-to-br ${m.bg} border ${m.border} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: `${m.color}18`, color: m.color }}
          >
            {m.icon}
          </div>
          <p className="text-2xl font-bold text-gray-800 leading-tight">{m.value}</p>
          <p className="text-sm font-semibold text-gray-600 mt-0.5">{m.label}</p>
          <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
        </div>
      ))}
    </div>
  );
}
