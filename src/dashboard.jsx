import React, { useState, useEffect } from 'react';
import './index.css';

const Dashboard = () => {
  const [temp, setTemp] = useState(24.5);
  const [hum, setHum] = useState(55);
  const [co2, setCo2] = useState(650);
  const [co, setCo] = useState(45);
  const [airQuality, setAirQuality] = useState("Good");
  const [coStatus, setCoStatus] = useState("Safe");
  const [lastUpdate, setLastUpdate] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const ESP_IP = '10.195.11.181';

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  const fetchSensorData = async () => {
    try {
      console.log("Fetching from:", `http://${ESP_IP}/data`);
      const response = await fetch(`http://${ESP_IP}/data`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      setTemp(parseFloat(data.temp) || 24.5);
      setHum(parseFloat(data.hum) || 55);
      setCo2(parseFloat(data.co2) || 650);
      setCo(parseFloat(data.co) || 45);
      setLastUpdate(new Date().toLocaleTimeString());
      setIsConnected(true);
    } catch (error) {
      console.error("Fetch failed:", error);
      setIsConnected(false);

      setTemp((Math.random() * 8 + 22).toFixed(1));
      setHum(Math.floor(Math.random() * 40) + 40);

      const randomCo2 = Math.floor(Math.random() * 1400) + 400;
      setCo2(randomCo2);

      const randomCo = Math.floor(Math.random() * 120) + 10;
      setCo(randomCo);

      updateAirQuality(randomCo2);
      updateCoStatus(randomCo);
      setLastUpdate(new Date().toLocaleTimeString());
    }
  };

  const updateAirQuality = (co2Value) => {
    if (co2Value <= 700) setAirQuality("Good");
    else if (co2Value <= 1000) setAirQuality("Moderate");
    else if (co2Value <= 1500) setAirQuality("Poor");
    else setAirQuality("Very Bad");
  };

  const updateCoStatus = (coValue) => {
    if (coValue <= 50) setCoStatus("Safe");
    else if (coValue <= 100) setCoStatus("Warning");
    else setCoStatus("Danger");
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateAirQuality(co2);
    updateCoStatus(co);
  }, [co2, co]);

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h1>RND Project Dashboard</h1>
          <p className="subtitle">Real-time Sensor Monitoring System</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="connection-status">
        <span className={`dot ${isConnected ? 'online' : 'offline'}`}></span>
        {isConnected ? 'Connected to ESP8266' : 'Disconnected - Using Demo Values'}
      </div>

      <div className="sensors-grid">
        <div className="sensor-card temp-card">
          <div className="card-header">
            <span className="icon">🌡️</span>
            <span>Temperature</span>
          </div>
          <div className="value">{temp}<span className="unit">°C</span></div>
          <div className="real-feel">Real feel • {Math.round(parseFloat(temp) + 1)}°C</div>
        </div>

        <div className="sensor-card humidity-card">
          <div className="card-header">
            <span className="icon">💧</span>
            <span>Humidity</span>
          </div>
          <div className="value">{Math.round(hum)}<span className="unit">%</span></div>
          <div className="status-text">Comfortable Range</div>
        </div>

        <div className="sensor-card co2-card">
          <div className="card-header">
            <span className="icon">🌬️</span>
            <span>Air Quality (CO₂)</span>
          </div>
          <div className="value">{co2}<span className="unit">PPM</span></div>
          <div className={`status-text ${airQuality.toLowerCase().replace(' ', '-')}`}>
            {airQuality}
          </div>
          <div className="real-feel">
            {co2 > 1000 ? "Ventilate the room!" : "Good ventilation"}
          </div>
        </div>

        <div className="sensor-card co-card">
          <div className="card-header">
            <span className="icon">☠️</span>
            <span>Carbon Monoxide (MQ-9)</span>
          </div>
          <div className="value">{co}<span className="unit">PPM</span></div>
          <div className={`status-text ${coStatus.toLowerCase()}`}>
            {coStatus}
          </div>
          <div className="real-feel">
            {co > 100 ? "Evacuate & Ventilate!" : "Normal levels"}
          </div>
        </div>
      </div>

      <div className="footer">
        <p>Data from ESP8266 + DHT11 + MQ135 + MQ-9 • Last updated: {lastUpdate || 'Never'}</p>
        <p className="small">IP: {ESP_IP} • Updates every 2 seconds</p>
      </div>
    </div>
  );
};

export default Dashboard;