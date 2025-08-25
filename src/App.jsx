import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Filter, BarChart3, Activity, Microscope, Calendar, MapPin } from 'lucide-react';
import SensibilityHeatmap from './components/SensibilityHeatmap';
import ResistanceHeatmap from './components/ResistanceHeatmap';
import SensibilityEvolutionChart from './components/SensibilityEvolutionChart';
import './App.css';

// Importar dados CSV
import csvData from './assets/processed_microrganismos.csv?raw';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    mes: 'todos',
    material: 'todos',
    local: 'todos',
    microrganismo: 'todos'
  });

  useEffect(() => {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    setData(rows);
    setFilteredData(rows);
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = data;

    if (filters.mes !== 'todos') {
      filtered = filtered.filter(item => item.Mes === filters.mes);
    }
    if (filters.material !== 'todos') {
      filtered = filtered.filter(item => item['Material Agrupado'] === filters.material);
    }
    if (filters.local !== 'todos') {
      filtered = filtered.filter(item => item.Local === filters.local);
    }
    if (filters.microrganismo !== 'todos') {
      filtered = filtered.filter(item => item.Microrganismo === filters.microrganismo);
    }

    setFilteredData(filtered);
  }, [data, filters]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalAmostras = filteredData.length;
    return {
      totalAmostras,
    };
  }, [filteredData]);

  // Dados para gráfico de microrganismos mais prevalentes
  const topMicrorganismos = useMemo(() => {
    const counts = {};
    filteredData.forEach(item => {
      const micro = item.Microrganismo;
      counts[micro] = (counts[micro] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([nome, count]) => {
        const tipo = filteredData.find(item => item.Microrganismo === nome)?.['Tipo Microrganismo'] || 'Bactéria';
        return { nome, count, tipo, prevalencia: ((count / filteredData.length) * 100).toFixed(1) };
      })
      .sort((a, b) => b.count - a.count);

    // Aplicar regra: 15 bactérias mais prevalentes + todos os fungos
    const bacterias = sorted.filter(item => item.tipo === 'Bactéria').slice(0, 15);
    const fungos = sorted.filter(item => item.tipo === 'Fungo');
    
    return [...bacterias, ...fungos];
  }, [filteredData]);

  // Dados para distribuição por material
  const materialDistribution = useMemo(() => {
    const counts = {};
    filteredData.forEach(item => {
      const material = item["Material Agrupado"];
      counts[material] = (counts[material] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([material, count]) => ({
        material,
        count,
        prevalencia: ((count / filteredData.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // Obter opções únicas para filtros
  const getUniqueValues = (field) => {
    return [...new Set(data.map(item => item[field]))].filter(Boolean).sort();
  };

  const meses = ['1', '2', '3', '4', '5', '6'];
  const materiais = getUniqueValues("Material Agrupado");
  const locais = getUniqueValues('Local');
  const microrganismos = getUniqueValues('Microrganismo');

  const limparFiltros = () => {
    setFilters({
      mes: 'todos',
      material: 'todos',
      local: 'todos',
      microrganismo: 'todos'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Microscope className="h-10 w-10 text-blue-600" />
            Dashboard de Microrganismos
          </h1>
          <p className="text-gray-600">Análise de prevalência e sensibilidade - Janeiro a Junho 2025</p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>
              Filtre os dados por período, material e localização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Mês
                </label>
                <Select value={filters.mes} onValueChange={(value) => setFilters({...filters, mes: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os meses</SelectItem>
                    {meses.map(mes => (
                      <SelectItem key={mes} value={mes}>
                        {new Date(2025, parseInt(mes) - 1).toLocaleString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  <Activity className="h-4 w-4 inline mr-1" />
                  Material
                </label>
                <Select value={filters.material} onValueChange={(value) => setFilters({...filters, material: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os materiais</SelectItem>
                    {materiais.map(material => (
                      <SelectItem key={material} value={material}>{material}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Setor
                </label>
                <Select value={filters.local} onValueChange={(value) => setFilters({...filters, local: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os setores</SelectItem>
                    {locais.map(local => (
                      <SelectItem key={local} value={local}>{local}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  <Microscope className="h-4 w-4 inline mr-1" />
                  Microrganismo
                </label>
                <Select value={filters.microrganismo} onValueChange={(value) => setFilters({...filters, microrganismo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o microrganismo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os microrganismos</SelectItem>
                  {microrganismos.map(micro => (
                    <SelectItem key={micro} value={micro}>
                      <span className="italic">{micro}</span>
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={limparFiltros} variant="outline" className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Amostras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAmostras}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Filtros Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {Object.entries(filters).map(([key, value]) => {
                  if (value !== 'todos') {
                    return (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {value}
                      </Badge>
                    );
                  }
                  return null;
                })}
                {Object.values(filters).every(v => v === 'todos') && (
                  <Badge variant="outline" className="text-xs">Nenhum filtro ativo</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Microrganismos mais prevalentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Microrganismos Mais Prevalentes
              </CardTitle>
              <CardDescription>
                Top 15 bactérias + todos os fungos por contagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topMicrorganismos} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="nome" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 10, angle: -30, textAnchor: 'end', fontStyle: 'italic' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Contagem']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="count">
                    {topMicrorganismos.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.tipo === 'Bactéria' ? '#8884d8' : '#82ca9d'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por material */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribuição por Material
              </CardTitle>
              <CardDescription>
                Contagem de amostras por tipo de material
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={materialDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="material" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Contagem']}
                    labelFormatter={(label) => `Material: ${label}`}
                  />
                  <Bar dataKey="count" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de calor de sensibilidade */}
        <SensibilityHeatmap data={filteredData} />

        {/* Mapa de calor de mecanismos de resistência */}
        <ResistanceHeatmap data={filteredData} />

        {/* Gráfico de evolução de sensibilidade */}
        <SensibilityEvolutionChart data={filteredData} />


      </div>
    </div>
  );
}

export default App;

