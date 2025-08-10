'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Droplets, TrendingUp, Calendar } from 'lucide-react';

interface WaterDataPoint {
  t: number;
  y: string;
}

interface WaterData {
  currentYearMaxDate: string;
  current: WaterDataPoint[];
  average: WaterDataPoint[];
  min: WaterDataPoint[];
  max: WaterDataPoint[];
  labelCurrent: string;
  labelAverage: string;
  labelMin: string;
  labelMax: string;
  yAxisLabel: string;
  colorCurrent?: string;
  colorAverage?: string;
  colorMin?: string;
  colorMax?: string;
}

interface ChartDataPoint {
  date: string;
  timestamp: number;
  current?: number;
  average?: number;
  min?: number;
  max?: number;
}

const WaterLevelComponent = () => {
  const [waterData, setWaterData] = useState<WaterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaterLevelData();
  }, []);

  const fetchWaterLevelData = async () => {
    try {
      // Use our Next.js API route to avoid CORS issues
      const response = await fetch('/api/water-levels?stationId=17&lang=EN');
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got an error response from our API
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch data');
      }
      
      setWaterData(data);
    } catch (error) {
      console.error('Error fetching water level data:', error);
      // Using sample data as fallback
      setWaterData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const sampleData = {
    "currentYearMaxDate": "2025-07-31T00:00:00",
    "current": [
      {"t": 1704067200000, "y": "1.85"}, // Jan 1, 2024
      {"t": 1706745600000, "y": "1.75"}, // Feb 1, 2024
      {"t": 1709251200000, "y": "1.65"}, // Mar 1, 2024
      {"t": 1711929600000, "y": "2.65"}, // Apr 1, 2024
      {"t": 1714521600000, "y": "3.45"}, // May 1, 2024
      {"t": 1717200000000, "y": "3.55"}, // Jun 1, 2024
      {"t": 1719792000000, "y": "3.45"}, // Jul 1, 2024
      {"t": 1722470400000, "y": "2.65"}, // Aug 1, 2024
      {"t": 1725148800000, "y": "2.05"}, // Sep 1, 2024
      {"t": 1727740800000, "y": "1.85"}, // Oct 1, 2024
      {"t": 1730419200000, "y": "1.75"}, // Nov 1, 2024
      {"t": 1733011200000, "y": "1.85"}  // Dec 1, 2024
    ],
    "average": [
      {"t": 1704067200000, "y": "1.70"}, // Jan 1, 2024
      {"t": 1706745600000, "y": "1.75"}, // Feb 1, 2024
      {"t": 1709251200000, "y": "1.80"}, // Mar 1, 2024
      {"t": 1711929600000, "y": "2.85"}, // Apr 1, 2024
      {"t": 1714521600000, "y": "3.55"}, // May 1, 2024
      {"t": 1717200000000, "y": "3.65"}, // Jun 1, 2024
      {"t": 1719792000000, "y": "3.25"}, // Jul 1, 2024
      {"t": 1722470400000, "y": "2.85"}, // Aug 1, 2024
      {"t": 1725148800000, "y": "2.25"}, // Sep 1, 2024
      {"t": 1727740800000, "y": "1.95"}, // Oct 1, 2024
      {"t": 1730419200000, "y": "1.75"}, // Nov 1, 2024
      {"t": 1733011200000, "y": "1.70"}  // Dec 1, 2024
    ],
    "min": [
      {"t": 1704067200000, "y": "1.45"}, // Jan 1, 2024
      {"t": 1706745600000, "y": "1.45"}, // Feb 1, 2024
      {"t": 1709251200000, "y": "1.45"}, // Mar 1, 2024
      {"t": 1711929600000, "y": "2.05"}, // Apr 1, 2024
      {"t": 1714521600000, "y": "2.85"}, // May 1, 2024
      {"t": 1717200000000, "y": "3.15"}, // Jun 1, 2024
      {"t": 1719792000000, "y": "2.65"}, // Jul 1, 2024
      {"t": 1722470400000, "y": "2.35"}, // Aug 1, 2024
      {"t": 1725148800000, "y": "1.75"}, // Sep 1, 2024
      {"t": 1727740800000, "y": "1.45"}, // Oct 1, 2024
      {"t": 1730419200000, "y": "1.45"}, // Nov 1, 2024
      {"t": 1733011200000, "y": "1.45"}  // Dec 1, 2024
    ],
    "max": [
      {"t": 1704067200000, "y": "2.45"}, // Jan 1, 2024
      {"t": 1706745600000, "y": "2.45"}, // Feb 1, 2024
      {"t": 1709251200000, "y": "2.25"}, // Mar 1, 2024
      {"t": 1711929600000, "y": "3.75"}, // Apr 1, 2024
      {"t": 1714521600000, "y": "4.15"}, // May 1, 2024
      {"t": 1717200000000, "y": "3.85"}, // Jun 1, 2024
      {"t": 1719792000000, "y": "3.65"}, // Jul 1, 2024
      {"t": 1722470400000, "y": "3.15"}, // Aug 1, 2024
      {"t": 1725148800000, "y": "2.85"}, // Sep 1, 2024
      {"t": 1727740800000, "y": "2.65"}, // Oct 1, 2024
      {"t": 1730419200000, "y": "2.25"}, // Nov 1, 2024
      {"t": 1733011200000, "y": "2.15"}  // Dec 1, 2024
    ],
    "labelCurrent": "Current",
    "labelAverage": "Average",
    "labelMin": "Min",
    "labelMax": "Max",
    "yAxisLabel": "Water Level (m)"
  };

  const formatChartData = (data: WaterData | null): ChartDataPoint[] => {
    if (!data) return [];
    
    // Use current year data as the base timeline
    const combined: Record<string, ChartDataPoint> = {};
    
    // First, add all current year data points
    data.current?.forEach((item: WaterDataPoint) => {
      const date = new Date(item.t).toISOString().split('T')[0];
      combined[date] = { 
        date,
        timestamp: item.t,
        current: parseFloat(item.y)
      };
    });
    
    // Helper function to map historical data to current year dates
    const mapHistoricalToCurrentYear = (historicalData: WaterDataPoint[], key: keyof ChartDataPoint) => {
      historicalData.forEach((item: WaterDataPoint) => {
        const historicalDate = new Date(item.t);
        const month = historicalDate.getMonth();
        const day = historicalDate.getDate();
        
        // Find the corresponding date in the current year data
        const currentYearDate = Object.keys(combined).find(dateStr => {
          const currentDate = new Date(dateStr);
          return currentDate.getMonth() === month && currentDate.getDate() === day;
        });
        
        if (currentYearDate && combined[currentYearDate]) {
          (combined[currentYearDate] as any)[key] = parseFloat(item.y);
        }
      });
    };
    
    // Map historical data to current year timeline
    if (data.average) mapHistoricalToCurrentYear(data.average, 'average');
    if (data.min) mapHistoricalToCurrentYear(data.min, 'min');
    if (data.max) mapHistoricalToCurrentYear(data.max, 'max');
    
    return Object.values(combined)
      .sort((a, b) => a.timestamp - b.timestamp); // Show all available data
  };

  const getCurrentLevel = () => {
    if (!waterData?.current?.length) return null;
    const latest = waterData.current[waterData.current.length - 1];
    return {
      level: parseFloat(latest.y),
      date: new Date(latest.t).toLocaleDateString()
    };
  };

  const getStatistics = () => {
    if (!waterData?.current?.length) return null;
    
    const levels = waterData.current.map(item => parseFloat(item.y));
    
    return {
      current: levels[levels.length - 1],
      max: Math.max(...levels),
      min: Math.min(...levels),
      average: levels.reduce((a, b) => a + b, 0) / levels.length
    };
  };

  const scrollToCurrentConditions = () => {
    document.getElementById('current-conditions')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const chartData = formatChartData(waterData);
  const currentLevel = getCurrentLevel();
  const stats = getStatistics();

  // Create placeholder data for consistent layout
  const placeholderStats = {
    current: 0,
    max: 0,
    min: 0,
    average: 0
  };

  const placeholderLevel = {
    level: 0,
    date: '--/--/----'
  };

  const displayStats = loading ? placeholderStats : stats;
  const displayLevel = loading ? placeholderLevel : currentLevel;

  return (
    <div className="container-fluid" style={{ maxWidth: '1200px' }}>
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-dark d-flex align-items-center justify-content-center gap-3 mb-4">
              <Droplets className="text-primary" size={48} />
              Parks Canada Water Level Monitor
            </h1>
            <p className="lead text-muted fs-4">Real-time water level monitoring and historical data</p>
            

          </div>

          {/* Current Level Card */}
          {displayLevel && (
            <div className="card mb-5 border-0 shadow-lg" style={{
              background: 'linear-gradient(135deg, #0284c7, #0891b2)',
              color: 'white'
            }}>
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="card-title h3 mb-3">Current Water Level</h2>
                    <div className="display-3 fw-bold mb-2">
                      {loading ? '-.---' : displayLevel.level.toFixed(3)} m
                    </div>
                                          <div className="mb-3 opacity-90">Last updated: {displayLevel.date}</div>
                      
                      {/* 30-day change */}
                      <div className="d-flex align-items-center mb-3" style={{minHeight: '1.5rem'}}>
                        {loading ? (
                          <div className="d-flex align-items-center">
                            <div className="spinner-border spinner-border-sm text-light me-2" style={{width: '0.8rem', height: '0.8rem'}} role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="opacity-75">Loading trend...</span>
                          </div>
                        ) : (() => {
                          const levels = waterData?.current?.map(item => parseFloat(item.y)) || [];
                          if (levels.length >= 30) {
                            const currentLevelValue = levels[levels.length - 1];
                            const thirtyDaysAgo = levels[levels.length - 30];
                            const change = currentLevelValue - thirtyDaysAgo;
                            const percentChange = (change / thirtyDaysAgo) * 100;
                            
                            return (
                              <div className="d-flex align-items-center flex-wrap gap-2">
                                <span className={`badge d-inline-flex align-items-center ${percentChange >= 0 ? 'bg-success' : 'bg-warning'} px-2 py-1`} style={{fontSize: '0.85rem', fontWeight: '600'}}>
                                  {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
                                </span>
                                <span className="opacity-75" style={{fontSize: '0.9rem'}}>
                                  {change >= 0 ? '+' : ''}{change.toFixed(2)}m (30 days)
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      
                      {/* Comparison to historical average */}
                      {!loading && displayLevel && waterData?.current?.length && waterData?.average?.length && (
                        <div>
                          {(() => {
                            const currentValue = displayLevel.level;
                            
                            // Find the historical average for the same time of year as the current reading
                            const currentData = waterData.current;
                            const latestCurrentEntry = currentData[currentData.length - 1];
                            const currentDate = new Date(latestCurrentEntry.t);
                            const currentMonth = currentDate.getMonth();
                            const currentDay = currentDate.getDate();
                            
                            // Find the closest historical average data point for the same date
                            const historicalAvgForDate = waterData.average.find(item => {
                              const avgDate = new Date(item.t);
                              return avgDate.getMonth() === currentMonth && avgDate.getDate() === currentDay;
                            });
                            
                            if (!historicalAvgForDate) return null;
                            
                            const historicalValue = parseFloat(historicalAvgForDate.y);
                            const difference = currentValue - historicalValue;
                            const percentDiff = Math.abs((difference / historicalValue) * 100);
                            
                            if (Math.abs(difference) < 0.01) {
                              return (
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-secondary me-2 px-2" style={{fontSize: '0.75rem', fontWeight: '600', color: 'white'}}>≈</span>
                                  <span className="opacity-75">Near historical average for this date</span>
                                </div>
                              );
                            } else if (difference > 0) {
                              return (
                                <div className="d-flex align-items-center">
                                  <span className="badge me-2 px-2" style={{fontSize: '0.75rem', fontWeight: '600', backgroundColor: waterData?.colorCurrent || "#4286f4", color: 'white'}}>↑</span>
                                  <span className="opacity-75">{percentDiff.toFixed(1)}% higher than historical average for this date</span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="d-flex align-items-center">
                                  <span className="badge me-2 px-2" style={{fontSize: '0.75rem', fontWeight: '600', backgroundColor: waterData?.colorAverage || "#f49541", color: 'white'}}>↓</span>
                                  <span className="opacity-75">{percentDiff.toFixed(1)}% lower than historical average for this date</span>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}
                  </div>
                  <div className="col-md-4 text-end">
                    <Droplets size={80} className="opacity-25" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chart shows current year with historical reference lines */}

          {/* Chart and Current Conditions Section */}
          <div className="row g-4 mb-5">
            {/* Chart - Left Side */}
            <div className="col-lg-8">
              <div className="card shadow h-100">
                <div className="card-body p-4">
                  <h3 className="card-title h4 d-flex align-items-center gap-2 mb-4">
                    <TrendingUp className="text-primary" size={24} />
                    Water Level Trends (Full Year)
                  </h3>
                  
                  <div style={{ width: '100%', height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{fontSize: 12}}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          label={{ value: waterData?.yAxisLabel || 'Water Level (m)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          labelFormatter={(value) => `Date: ${value}`}
                          formatter={(value, name) => [
                            `${parseFloat(String(value)).toFixed(3)} m`, 
                            String(name).charAt(0).toUpperCase() + String(name).slice(1)
                          ]}
                        />
                        <Legend />
                        
                        {/* Current year data */}
                        <Line 
                          type="monotone" 
                          dataKey="current" 
                          stroke={waterData?.colorCurrent || "#4286f4"} 
                          strokeWidth={3}
                          name="Current Year"
                          dot={false}
                        />
                        
                        {/* Historical reference lines */}
                        <Line 
                          type="monotone" 
                          dataKey="average" 
                          stroke={waterData?.colorAverage || "#f49541"} 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Historical Average"
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="max" 
                          stroke={waterData?.colorMax || "#e8dc37"} 
                          strokeWidth={1}
                          name="Historical Maximum"
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="min" 
                          stroke={waterData?.colorMin || "#b03ef2"} 
                          strokeWidth={1}
                          name="Historical Minimum"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Conditions - Right Side */}
            <div className="col-lg-4">
              <div id="current-conditions" className="h-100">
                <h4 className="d-flex align-items-center gap-2 mb-4">
                  <Calendar className="text-primary" size={24} />
                  Current Conditions
                </h4>

                {displayStats && (
                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <div className="card shadow border-start border-4" style={{borderLeftColor: waterData?.colorCurrent || "#4286f4", borderLeftWidth: '4px'}}>
                        <div className="card-body p-3">
                          <h6 className="card-title text-muted mb-2">Current Level</h6>
                          <div className="h4 fw-bold mb-0" style={{color: waterData?.colorCurrent || "#4286f4"}}>
                            {loading ? '-.---' : displayStats.current.toFixed(3)} m
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="card shadow border-start border-4" style={{borderLeftColor: waterData?.colorAverage || "#f49541", borderLeftWidth: '4px'}}>
                        <div className="card-body p-3">
                          <h6 className="card-title text-muted mb-2">Year Average</h6>
                          <div className="h4 fw-bold mb-0" style={{color: waterData?.colorAverage || "#f49541"}}>
                            {loading ? '-.---' : displayStats.average.toFixed(3)} m
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="card shadow border-start border-4" style={{borderLeftColor: waterData?.colorMax || "#e8dc37", borderLeftWidth: '4px'}}>
                        <div className="card-body p-3">
                          <h6 className="card-title text-muted mb-2">Year Maximum</h6>
                          <div className="h4 fw-bold mb-0" style={{color: waterData?.colorMax || "#e8dc37"}}>
                            {loading ? '-.---' : displayStats.max.toFixed(3)} m
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="card shadow border-start border-4" style={{borderLeftColor: waterData?.colorMin || "#b03ef2", borderLeftWidth: '4px'}}>
                        <div className="card-body p-3">
                          <h6 className="card-title text-muted mb-2">Year Minimum</h6>
                          <div className="h4 fw-bold mb-0" style={{color: waterData?.colorMin || "#b03ef2"}}>
                            {loading ? '-.---' : displayStats.min.toFixed(3)} m
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Source Info */}
                <div className="card bg-light">
                  <div className="card-body p-3">
                    <h6 className="card-title text-muted mb-2">Data Source</h6>
                    <p className="card-text text-muted mb-1 small">
                      Water level data provided by Parks Canada through their official API
                    </p>
                    <small className="text-muted">
                      Station ID: 17 | Data updated continuously
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelComponent; 