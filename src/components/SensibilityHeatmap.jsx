import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';

const SensibilityHeatmap = ({ data }) => {
  // Lista dos principais antibióticos para análise
  const antibiotics = [
    'AMICACINA',
    'CIPROFLOXACINA',
    'CEFTRIAXONA',
    'MEROPENEM',
    'VANCOMICINA',
    'PIPERACILINA / TAZOBACTAM',
    'COLISTINA',
    'CEFTOLOZANE/TAZOBACTAM',
    'CEFTAZIDIMA / AVIBACTAM',
    'OXACILINA',
    'AMPICILINA'
  ];

  // Calcular dados do mapa de calor
  const heatmapData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Contar microrganismos mais comuns (top 15)
    const microCounts = {};
    data.forEach(item => {
      const micro = item.Microrganismo;
      if (micro && micro.trim()) {
        microCounts[micro] = (microCounts[micro] || 0) + 1;
      }
    });

    const topMicros = Object.entries(microCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15) // Alterado de 10 para 15
      .map(([micro]) => micro);

    // Calcular sensibilidade para cada combinação microrganismo-antibiótico
    const heatmapMatrix = [];
    
    topMicros.forEach(micro => {
      const microData = data.filter(item => item.Microrganismo === micro);
      const row = { microrganismo: micro };
      
      antibiotics.forEach(antibiotic => {
        const results = microData
          .map(item => item[antibiotic])
          .filter(result => result && result.trim());
        
        if (results.length === 0) {
          row[antibiotic] = null;
          return;
        }

        const sensible = results.filter(result => 
          result.includes('Sensível') || result.includes('sensível')
        ).length;
        
        const resistant = results.filter(result => 
          result.includes('Resistente') || result.includes('resistente')
        ).length;

        const total = sensible + resistant;
        
        if (total === 0) {
          row[antibiotic] = null;
        } else {
          row[antibiotic] = (sensible / total) * 100;
        }
      });
      
      heatmapMatrix.push(row);
    });

    return heatmapMatrix;
  }, [data]);

  const getColorClass = (value) => {
    if (value === null || value === undefined) return 'bg-gray-200';
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-green-400';
    if (value >= 40) return 'bg-yellow-400';
    if (value >= 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getTextColor = (value) => {
    if (value === null || value === undefined) return 'text-gray-600';
    if (value >= 40) return 'text-white';
    return 'text-black';
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Mapa de Calor - Sensibilidade aos Antibióticos
        </CardTitle>
        <CardDescription>
          Percentual de sensibilidade dos 15 microrganismos mais prevalentes aos principais antibióticos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header com nomes dos antibióticos */}
            <div className="grid grid-cols-12 gap-1 mb-2"> {/* Ajustado para 12 colunas (1 microrganismo + 11 antibióticos) */}
              <div className="p-2 text-xs font-medium text-gray-700">
                Microrganismo
              </div>
              {antibiotics.map(antibiotic => (
                <div key={antibiotic} className="p-2 text-xs font-medium text-gray-700 text-center">
                  <div className="transform -rotate-45 origin-center whitespace-nowrap">
                    {antibiotic.replace(' / ', '/')}
                  </div>
                </div>
              ))}
            </div>

            {/* Dados do mapa de calor */}
            {heatmapData.map((row, index) => (
              <div key={index} className="grid grid-cols-12 gap-1 mb-1"> {/* Ajustado para 12 colunas */}
                <div className="p-2 text-xs font-medium text-gray-900 bg-gray-100 rounded italic">
                  {row.microrganismo.length > 20 
                    ? `${row.microrganismo.substring(0, 20)}...` 
                    : row.microrganismo}
                </div>
                {antibiotics.map(antibiotic => {
                  const value = row[antibiotic];
                  return (
                    <div
                      key={antibiotic}
                      className={`p-2 text-xs text-center rounded ${getColorClass(value)} ${getTextColor(value)}`}
                      title={value !== null ? `${value.toFixed(1)}% sensível` : 'Sem dados'}
                    >
                      {value !== null ? `${value.toFixed(0)}%` : 'N/A'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          <span className="font-medium">Legenda:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>≥80% sensível</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>40-59%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span>20-39%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>&lt;20%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>Sem dados</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensibilityHeatmap;



