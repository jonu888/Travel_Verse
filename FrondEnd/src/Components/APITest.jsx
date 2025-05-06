import React, { useState, useEffect } from 'react';

const APITest = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/test/');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">API Test</h2>
            {data && (
                <div className="bg-gray-100 p-4 rounded">
                    <p>Message: {data.message}</p>
                    <p>Status: {data.status}</p>
                </div>
            )}
        </div>
    );
};

export default APITest; 