import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { LineChart } from 'lucide-react';

const SensibilityEvolutionChart = ({ data }) => {
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

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const monthlyData = {};

    // Get top 15 microorganisms
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

    data.forEach(item => {
      const month = item.Mes; // Assuming 'Mes' is a numeric string like '1', '2', etc.
      const microorganism = item.Microrganismo;

      if (!topMicros.includes(microorganism)) return; // Only include top 15 micros

      if (!monthlyData[month]) {
        monthlyData[month] = {};
      }

      antibiotics.forEach(antibiotic => {
        if (!monthlyData[month][antibiotic]) {
          monthlyData[month][antibiotic] = { sensible: 0, resistant: 0 };
        }

        const result = item[antibiotic];
        if (result) {
          if (result.toLowerCase().includes('sensível')) {
            monthlyData[month][antibiotic].sensible++;
          } else if (result.toLowerCase().includes('resistente')) {
            monthlyData[month][antibiotic].resistant++;
          }
        }
      });
    });

    const formattedData = Object.keys(monthlyData).sort((a, b) => parseInt(a) - parseInt(b)).map(month => {
      const monthName = new Date(2025, parseInt(month) - 1).toLocaleString('pt-BR', { month: 'short' });
      const monthEntry = { name: monthName };

      antibiotics.forEach(antibiotic => {
        const total = monthlyData[month][antibiotic].sensible + monthlyData[month][antibiotic].resistant;
        if (total > 0) {
          monthEntry[antibiotic] = (monthlyData[month][antibiotic].sensible / total) * 100;
        } else {
          monthEntry[antibiotic] = 0; // Or null, depending on how you want to represent no data
        }
      });
      return monthEntry;
    });

    return formattedData;
  }, [data]);

  const getAntibioticShortName = (antibiotic) => {
    return antibiotic.replace(' / ', '/');
  };

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#8DFF8D', '#FF8D8D'];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Evolução da Sensibilidade aos Antibióticos (Top 15 Microrganismos)
        </CardTitle>
        <CardDescription>
          Percentual de sensibilidade mês a mês para os 15 microrganismos mais prevalentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Sensibilidade (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
            {antibiotics.map((antibiotic, index) => (
              <Bar key={antibiotic} dataKey={antibiotic} fill={colors[index % colors.length]} name={getAntibioticShortName(antibiotic)} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SensibilityEvolutionChart;


