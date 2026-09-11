import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle }) => {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.bg} ${scheme.text}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatCard;