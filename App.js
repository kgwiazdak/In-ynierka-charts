import React, { Component } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import './App.css'


import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
} from 'chart.js';

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      points: [],
      x: 0,
      y: 0,
      chartData: {
        datasets: [
          {
            label: 'Last 5 Points',
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      },
      barChart: {
        datasets: [
          {
            label: 'Quantity',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            data: [0, 0, 0, 0, 0, 0, 0],
          },
        ],
      },
      displayedPoints: 5, 
    }
  }

  componentDidMount() {
    this.fetchPoints();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.points !== this.state.points) {
      this.updateChartData();
    }

    if (prevState.displayedPoints !== this.state.displayedPoints) {
      this.fetchPoints();
    }
  }

  fetchPoints = () => {
    const { displayedPoints } = this.state;
    console.log(displayedPoints);
    axios.get(`http://localhost:8000/points/?limit=${displayedPoints}`)
      .then(response => {
        this.setState({ points: response.data });
      })
      .catch(error => {
        console.error('Error fetching points', error);
      });
  };


  updateChartData = () => {
    this.setState(prevState => {
      const { points, displayedPoints } = prevState;
      const lastDisplayedPoints = points.slice(-displayedPoints).reverse();
      const quantities = Array(7).fill(0);
  
      const labels = [];
      for (let i = displayedPoints; i >= 1; i--) {
        labels.push(`Point ${i}`);
      }
  
      lastDisplayedPoints.forEach(point => {
        const y = point.y;
        if (y >= 1 && y <= 7) {
          quantities[y - 1]++;
        }
      });
  
      const updatedChartData = {
        labels: labels,
        datasets: [
          {
            label: `Last ${displayedPoints} Points`,
            data: lastDisplayedPoints.map(point => point.y),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.2,
          },
        ],
      };
  
      const updatedBarChart = {
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [
          {
            label: 'Quantity',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
            data: quantities,
          },
        ],
      };
  
      return { chartData: updatedChartData, barChart: updatedBarChart };
    });
  };
  

  handleCreatePoint = () => {
    const { x, y } = this.state;
    axios.post('http://localhost:8000/points/', { x, y })
      .then(response => {
        this.fetchPoints();
        this.setState({ x: 0, y: 0 });
      })
      .catch(error => {
        console.error('Error creating point', error);
      });
  };

  handleDeletePoint = pointId => {
    axios.delete(`http://localhost:8000/points/${pointId}/`)
      .then(() => {
        this.fetchPoints();
      })
      .catch(error => {
        console.error('Error deleting point', error);
      });
  };

  handleAddRandomPoint = () => {
    const { x } = this.state;
    const randomY = Math.floor(Math.random() * 7) + 1;
    axios.post('http://localhost:8000/points/', { x, y: randomY })
      .then(response => {
        this.fetchPoints();
        this.setState(prevState => ({ x: prevState.x + 1 }));
      })
      .catch(error => {
        console.error('Error creating random point', error);
      });
  };

  handleDisplayedPointsChange = (newDisplayedPoints) => {
    this.setState({ displayedPoints: newDisplayedPoints }, () => {
      this.updateChartData();
    });
  };

  render() {
    const { points, x, y, chartData, barChart, displayedPoints } = this.state;
    const options = {
      scales: {
        y: {
          beginAtZero: false,
          suggestedMin: 1,
          suggestedMax: 7,
        },
      },
    };
    const barOptions = {
      indexAxis: 'x',
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 7,
        },
      },
    };

    return (
      <div>
        <h1>Last {displayedPoints} Points</h1>
        <div style={{ display: 'inline-block' }}>
          <div className="chart-container">
            <Line data={chartData} options={options} />
          </div>
        </div>
        <div style={{ display: 'inline-block' }}>
          <div className="chart-container">
            <Bar data={barChart} options={barOptions} />
          </div>
        </div>
        <ul>
          {points && points.length > 0 ? points.map(point => (
            <li key={point.id}>
              X: {point.x} - Y: {point.y}  
              <button onClick={() => this.handleDeletePoint(point.id)}>Delete</button>
            </li>
          )) : <li>No points to display</li>}
        </ul>
        <input
          type="number"
          value={x}
          onChange={(e) => this.setState({ x: e.target.value })}
          placeholder="X coordinate"
        />
        <input
          type="number"
          value={y}
          onChange={(e) => this.setState({ y: e.target.value })}
          placeholder="Y coordinate"
        />
        <button onClick={this.handleCreatePoint}>Add Point</button>
        <button onClick={this.handleAddRandomPoint}>Add Random Point</button>
        <button onClick={() => this.handleDisplayedPointsChange(5)}>Display Last 5 Points</button>
        <button onClick={() => this.handleDisplayedPointsChange(10)}>Display Last 10 Points</button>
        
      </div>
    );
  }
}

export default App;

