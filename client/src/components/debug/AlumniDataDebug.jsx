import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Debug component to check alumni data structure
 * Access at /debug/alumni-data
 */
const AlumniDataDebug = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/alumni');
        console.log('Raw API response:', response.data);
        setAlumni(response.data);
      } catch (err) {
        console.error('Error fetching alumni data:', err);
        setError(err.message || 'Failed to fetch alumni data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading alumni data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Alumni Data Debug</h1>
      <p className="mb-4">Found {alumni.length} alumni records</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Education</th>
              <th className="p-2 border">Raw Education</th>
              <th className="p-2 border">University</th>
              <th className="p-2 border">Degree</th>
            </tr>
          </thead>
          <tbody>
            {alumni.map((alum, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-2 border">{alum.name || 'N/A'}</td>
                <td className="p-2 border">{alum.email || 'N/A'}</td>
                <td className="p-2 border">{alum.education || 'N/A'}</td>
                <td className="p-2 border">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(alum.education, null, 2)}
                  </pre>
                </td>
                <td className="p-2 border">{alum.university || 'N/A'}</td>
                <td className="p-2 border">{alum.degree || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlumniDataDebug;
