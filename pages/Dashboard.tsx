import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { calculateMetrics, getAgingData, getTreemapData } from '../lib/metrics';
import { formatCurrency, formatDate } from '../lib/utils';
import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Treemap
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Clock, Users, CheckCircle2, Layers, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const KPICard = ({ title, value, count, subtext, icon: Icon, color, isCurrency = true }: any) => (
    <div className="bg-brand-surface p-5 rounded-2xl border border-gray-100 shadow-sm relative hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</p>
            <div className={`p-1.5 rounded-lg ${color} bg-opacity-10 absolute top-3 right-3`}>
                <Icon size={18} className={color.replace('bg-', 'text-')} />
            </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2 truncate pr-2" title={isCurrency ? formatCurrency(value) : value}>
            {isCurrency ? formatCurrency(value) : value}
        </h3>

        {(count !== undefined || subtext) && (
            <div className="flex flex-col gap-1">
                {count !== undefined && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Qtd</span>
                        <span className="text-xs font-semibold text-gray-700">{count}</span>
                    </div>
                )}
                {subtext && <p className="text-[10px] text-gray-400">{subtext}</p>}
            </div>
        )}
    </div>
);

const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name, value, payload, fill } = props;
    const color = fill || payload?.fill || '#cbd5e1';

    const showText = width > 60 && height > 40;
    const showValue = width > 80 && height > 60;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: color,
                    stroke: '#fff',
                    strokeWidth: 2,
                }}
            />
            {showText && (
                <foreignObject x={x} y={y} width={width} height={height} style={{ pointerEvents: 'none' }}>
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center overflow-hidden">
                        <span className="text-white font-bold text-xs leading-tight line-clamp-2 drop-shadow-md">
                            {name}
                        </span>
                        {showValue && (
                            <span className="text-white text-[10px] mt-1 opacity-95 font-medium drop-shadow-md">
                                {formatCurrency(value)}
                            </span>
                        )}
                    </div>
                </foreignObject>
            )}
        </g>
    );
};

const CustomTreemapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-lg text-sm z-50">
                <p className="font-bold text-gray-900 mb-1 border-b pb-1">{data.name}</p>
                <div className="space-y-1">
                    <p className="text-gray-600 flex justify-between gap-4">
                        <span>Valor Vencido:</span>
                        <span className="font-bold">{formatCurrency(data.value)}</span>
                    </p>
                    <p className="text-gray-600 flex justify-between gap-4">
                        <span>Qtd. Títulos:</span>
                        <span className="font-medium">{data.qtdTitulos}</span>
                    </p>
                    <p className="text-gray-600 flex justify-between gap-4">
                        <span>Atraso Médio:</span>
                        <span className={`font-bold ${data.atrasoMedio > 90 ? 'text-red-600' :
                            data.atrasoMedio > 60 ? 'text-orange-600' :
                                data.atrasoMedio > 30 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {data.atrasoMedio} dias
                        </span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export const Dashboard = () => {
    const { filteredData } = useData();
    const navigate = useNavigate();
    const metrics = useMemo(() => calculateMetrics(filteredData), [filteredData]);
    const agingData = useMemo(() => getAgingData(filteredData), [filteredData]);

    const [treemapDimension, setTreemapDimension] = useState<'Empresa' | 'Cliente' | 'Obra' | 'Banco'>('Empresa');

    const treemapData = useMemo(() => {
        const data = getTreemapData(filteredData, treemapDimension);
        if (!data) return [];
        return data;
    }, [filteredData, treemapDimension]);

    const receiptData = useMemo(() => {
        const buckets: any = {};
        filteredData.forEach(d => {
            if (d.dt_recebimento && d.Status === 'Pago') {
                const key = formatDate(d.dt_recebimento);
                buckets[key] = (buckets[key] || 0) + (d.Valor_parcial || d.Valot_total);
            }
        });
        return Object.keys(buckets).slice(-7).map(k => ({ date: k, value: buckets[k] }));
    }, [filteredData]);

    const topPendencias = useMemo(() => {
        return filteredData
            .filter(i => i.Status !== 'Pago')
            .sort((a, b) => b.Saldo_a_pagar - a.Saldo_a_pagar)
            .slice(0, 5);
    }, [filteredData]);

    const handleTreemapClick = (data: any) => {
        if (!data || !data.name) return;

        const param = treemapDimension === 'Cliente' ? 'cliente' : 'search';
        navigate(`/titulos?${param}=${encodeURIComponent(data.name)}`);
    };

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <KPICard
                    title="Recebido (Filtro)"
                    value={metrics.recebidoPeriodo}
                    count={metrics.countRecebidoPeriodo}
                    icon={CheckCircle2}
                    color="bg-emerald-500 text-emerald-500"
                />
                <KPICard
                    title="Vencido (Saldo)"
                    value={metrics.saldoVencido}
                    count={metrics.countSaldoVencido}
                    icon={AlertCircle}
                    color="bg-state-critical text-state-critical"
                />
                <KPICard
                    title="A Vencer (30d)"
                    value={metrics.aVencer30d}
                    count={metrics.countAVencer30d}
                    icon={Clock}
                    color="bg-blue-500 text-blue-500"
                />
                <KPICard
                    title="% Vencido"
                    value={metrics.percentualVencido.toFixed(1) + '%'}
                    count={metrics.countSaldoVencido}
                    subtext="do total em aberto"
                    isCurrency={false}
                    icon={ArrowDownRight}
                    color="bg-orange-500 text-orange-500"
                />
                <KPICard
                    title="Clientes Atraso"
                    value={metrics.clientesAtraso}
                    count={metrics.countClientesAtrasoTitulos}
                    isCurrency={false}
                    icon={Users}
                    color="bg-purple-500 text-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Aging (Vencidos)</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={agingData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px' }} />
                                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {agingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                    <h3 className="font-bold text-gray-800 mb-4">Recebimentos (Últimos 7 dias)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={receiptData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                                <YAxis style={{ fontSize: '12px' }} />
                                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                <Line type="monotone" dataKey="value" stroke="#32CD32" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Layers size={18} className="text-brand-dark" />
                            Mapa de Risco — Concentração de Dívida
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Tamanho do bloco = Valor Vencido | Cor = Atraso Médio
                        </p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['Empresa', 'Cliente'].map((dim) => (
                            <button
                                key={dim}
                                onClick={() => setTreemapDimension(dim as any)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${treemapDimension === dim
                                    ? 'bg-white text-brand-dark shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {dim}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-96 w-full">
                    {treemapData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={treemapData}
                                dataKey="value"
                                nameKey="name"
                                aspectRatio={4 / 3}
                                stroke="#fff"
                                content={<CustomTreemapContent />}
                                onClick={handleTreemapClick}
                                style={{ cursor: 'pointer' }}
                            >
                                <Tooltip content={<CustomTreemapTooltip />} />
                            </Treemap>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Filter size={32} className="opacity-20 mb-2" />
                            <p>Não há títulos vencidos no período/filtro selecionado.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Top 5 Pendências (Valor Individual)</h3>
                    <Link to="/titulos" className="text-sm text-brand-action font-medium hover:underline">Ver todos</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Empresa</th>
                                <th className="px-6 py-3">Vencimento</th>
                                <th className="px-6 py-3 text-right">Saldo</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topPendencias.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {item.clienteInfo?.NombreComercial || item.Cliente}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{item.Empresa}</td>
                                    <td className="px-6 py-4 text-gray-500">{formatDate(item.Dt_venc)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(item.Saldo_a_pagar)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.Status === 'Vencido' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {item.Status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link to={`/titulos/${item.id}`} className="text-brand-action hover:text-green-700 font-medium">Abrir</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};