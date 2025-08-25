import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield } from 'lucide-react';

const ResistanceHeatmap = ({ data }) => {
  // Lista dos mecanismos de resistência
  const resistanceMechanisms = [
    'Mecanismos de Resistência - AMPC',
    'Mecanismos de Resistência - CARBA',
    'Mecanismos de Resistência - ESBL',
    'Mecanismos de Resistência - KPC',
    'Mecanismos de Resistência - MECPES',
    'Mecanismos de Resistência - META',
    'Mecanismos de Resistência - OXA'
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
      .slice(0, 15)
      .map(([micro]) => micro);

    // Calcular presença de mecanismos de resistência para cada combinação microrganismo-mecanismo
    const heatmapMatrix = [];
    
    topMicros.forEach(micro => {
      const microData = data.filter(item => item.Microrganismo === micro);
      const row = { microrganismo: micro };
      
      resistanceMechanisms.forEach(mechanism => {
        // Incluir células vazias no cálculo do denominador
        const results = microData.map(item => item[mechanism]);
        
        // Filtrar apenas resultados que são explícitos (positivo/negativo/sim/não/presente)
          const positiveResults = results.filter(result => 
            result && (result.toLowerCase().includes('positivo') || 
            result.toLowerCase().includes('sim') ||
            result.toLowerCase().includes('presente'))
          );
          
          const totalConsidered = results.length; 

          if (totalConsidered === 0) {
            row[mechanism] = null;
          } else {
            const percentage = (positiveResults.length / totalConsidered) * 100;
            row[mechanism] = Math.round(percentage);
          }
      });
      
      heatmapMatrix.push(row);
    });

    return heatmapMatrix;
  }, [data]);

  const getBackgroundColor = (value) => {
    if (value === null || value === undefined) return 'bg-gray-200';
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-red-400';
    if (value >= 40) return 'bg-orange-400';
    if (value >= 20) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getTextColor = (value) => {
    if (value === null || value === undefined) return 'text-gray-600';
    if (value >= 40) return 'text-white';
    return 'text-black';
  };

  const getMechanismShortName = (mechanism) => {
    return mechanism.replace('Mecanismos de Resistência - ', '');
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Mapa de Calor - Mecanismos de Resistência
        </CardTitle>
        <CardDescription>
          Percentual de presença dos mecanismos de resistência nos 15 microrganismos mais prevalentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header com nomes dos mecanismos */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-xs font-medium text-gray-700">
                Microrganismo
              </div>
              {resistanceMechanisms.map(mechanism => (
                <div key={mechanism} className="p-2 text-xs font-medium text-gray-700 text-center">
                  <div className="transform -rotate-45 origin-center whitespace-nowrap">
                    {getMechanismShortName(mechanism)}
                  </div>
                </div>
              ))}
            </div>

            {/* Dados do mapa de calor */}
            {heatmapData.map((row, index) => (
              <div key={index} className="grid grid-cols-8 gap-1 mb-1">
                <div className="p-2 text-xs font-medium text-gray-700 truncate italic">
                  {row.microrganismo.length > 20 
                    ? `${row.microrganismo.substring(0, 20)}...` 
                    : row.microrganismo}
                </div>
                {resistanceMechanisms.map(mechanism => {
                  const value = row[mechanism];
                  return (
                    <div
                      key={mechanism}
                      className={`p-2 text-xs text-center ${getBackgroundColor(value)} ${getTextColor(value)} rounded`}
                    >
                      {value === null || value === undefined ? 'N/A' : `${value}%`}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legenda */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <div className="font-medium text-gray-700">Legenda:</div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>&lt;20% presente</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>20-39%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-orange-400 rounded"></div>
                <span>40-59%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-400 rounded"></div>
                <span>60-79%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>≥80% presente</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Sem dados</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResistanceHeatmap;

