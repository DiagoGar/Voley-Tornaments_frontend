'use client';

import { useEffect, useState } from 'react';

export default function GenerarFixture() {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');

  const [filteredSeries, setFilteredSeries] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/series')
      .then(res => res.json())
      .then(data => {
        setSeries(data);

        // Extraer categorías únicas de las series
        const categoriesMap = new Map();
        data.forEach((s: any) => {
          if (s.category) {
            categoriesMap.set(s.category._id, s.category);
          }
        });
        setCategories(Array.from(categoriesMap.values()));
      });
  }, []);

  const handleGenerate = async () => {
    if (!selectedCategory || !selectedSerie) {
      alert('Selecciona una categoría y una serie');
      return;
    }

    const res = await fetch('http://localhost:5000/api/fixture/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: selectedCategory,
        serieId: selectedSerie
      })
    });

    const result = await res.json();
    if (res.ok) {
      alert(`Fixture generado: ${result.count} partidos`);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Generar Fixture</h1>

      <select
        className="border p-2 mb-4 w-full"
        value={selectedCategory}
        onChange={e => {
          const categoryId = e.target.value;
          setSelectedCategory(categoryId);
          setSelectedSerie('');
          setFilteredSeries(
            series.filter((s: any) => s.category?._id === categoryId)
          );
        }}
      >
        <option value="">Selecciona una categoría</option>
        {categories.map((c: any) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      <select
        className="border p-2 mb-4 w-full"
        value={selectedSerie}
        onChange={e => setSelectedSerie(e.target.value)}
        disabled={!selectedCategory}
      >
        <option value="">Selecciona una serie</option>
        {filteredSeries.map((s: any) => (
          <option key={s._id} value={s._id}>{s.name}</option>
        ))}
      </select>

      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generar Fixture
      </button>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded ml-3"
      >
        <a href='../partidos'>Ver Partidos</a>
      </button>
    </div>
  );
}
