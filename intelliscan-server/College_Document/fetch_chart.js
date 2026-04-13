const https = require('https');
const fs = require('fs');
const path = require('path');

const config = {
  type: 'line',
  data: {
    labels: ['Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6', 'Sprint 7'],
    datasets: [
      {
        label: 'Planned Hours',
        data: [240, 240, 240, 240, 240, 240],
        borderColor: '#4472c4',
        fill: false,
        borderWidth: 2,
        pointRadius: 0
      },
      {
        label: 'Earned Values',
        data: [8.3, 8.3, 14, 10, 7.9, 8.3],
        borderColor: '#c00000',
        fill: false,
        borderWidth: 2,
        pointRadius: 0
      }
    ]
  },
  options: {
    title: { display: true, text: 'Burnt Chart', fontSize: 20 },
    legend: { position: 'bottom' },
    scales: {
      yAxes: [{ ticks: { min: 0, max: 300, stepSize: 50 }, gridLines: { color: '#e5e5e5' } }],
      xAxes: [{ gridLines: { display: false } }]
    },
    plugins: {
      datalabels: { backgroundColor: 'white', borderRadius: 2 }
    }
  }
};

const c = encodeURIComponent(JSON.stringify(config));
const url = `https://quickchart.io/chart?w=800&h=500&c=${c}`;

const outputPath = path.join(__dirname, 'Burnt_Chart.png');

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download chart, status code: ${res.statusCode}`);
    return;
  }
  const file = fs.createWriteStream(outputPath);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log(`Successfully downloaded chart to ${outputPath}`);
  });
}).on('error', (err) => {
  console.error('Error downloading chart:', err.message);
});
