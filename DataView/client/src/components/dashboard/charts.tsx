import { useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EditableText from '@/components/ui/editable-text';
import OverviewInsights from '@/components/dashboard/overview-insights';
import { DataRow } from '@/types/dashboard';
import Chart from 'chart.js/auto';

interface ChartsProps {
  data: DataRow[];
}

export default function Charts({ data }: ChartsProps) {
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const userChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ [key: string]: Chart }>({});

  const chartData = useMemo(() => {
    if (!data.length) return null;

    const numericColumns = Object.keys(data[0]).filter(key => 
      data.some(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
    );

    const textColumns = Object.keys(data[0]).filter(key => 
      data.some(row => typeof row[key] === 'string' && isNaN(Number(row[key])))
    );

    // Revenue trend data (using first numeric column)
    const revenueData = data.slice(-7).map((row, index) => ({
      label: `Day ${index + 1}`,
      value: Number(row[numericColumns[0]]) || 0
    }));

    // User distribution data (using first text column)
    const categoryData = textColumns.length > 0 ? 
      Object.entries(
        data.reduce((acc, row) => {
          const category = row[textColumns[0]] || 'Unknown';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).slice(0, 5) : [];

    // Category performance (using numeric data grouped by category)
    const categoryPerformance = textColumns.length > 0 && numericColumns.length > 0 ?
      Object.entries(
        data.reduce((acc, row) => {
          const category = row[textColumns[0]] || 'Unknown';
          const value = Number(row[numericColumns[0]]) || 0;
          acc[category] = (acc[category] || 0) + value;
          return acc;
        }, {} as Record<string, number>)
      ).slice(0, 6) : [];

    return {
      revenue: revenueData,
      distribution: categoryData,
      performance: categoryPerformance
    };
  }, [data]);

  useEffect(() => {
    if (!chartData) return;

    // Cleanup existing charts
    Object.values(chartInstances.current).forEach(chart => chart.destroy());
    chartInstances.current = {};

    // Revenue Chart
    if (revenueChartRef.current && chartData.revenue.length > 0) {
      chartInstances.current.revenue = new Chart(revenueChartRef.current, {
        type: 'line',
        data: {
          labels: chartData.revenue.map(d => d.label),
          datasets: [{
            label: 'Revenue',
            data: chartData.revenue.map(d => d.value),
            borderColor: 'hsl(174, 72%, 56%)',
            backgroundColor: 'hsla(174, 72%, 56%, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // User Distribution Chart
    if (userChartRef.current && chartData.distribution.length > 0) {
      chartInstances.current.user = new Chart(userChartRef.current, {
        type: 'pie',
        data: {
          labels: chartData.distribution.map(([label]) => label),
          datasets: [{
            data: chartData.distribution.map(([, value]) => value),
            backgroundColor: [
              'hsl(174, 72%, 56%)',
              'hsl(173, 58%, 39%)',
              'hsl(197, 37%, 24%)',
              'hsl(43, 74%, 66%)',
              'hsl(27, 87%, 67%)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Category Performance Chart
    if (categoryChartRef.current && chartData.performance.length > 0) {
      chartInstances.current.category = new Chart(categoryChartRef.current, {
        type: 'bar',
        data: {
          labels: chartData.performance.map(([label]) => label),
          datasets: [{
            label: 'Performance',
            data: chartData.performance.map(([, value]) => value),
            backgroundColor: 'hsl(174, 72%, 56%)',
            borderColor: 'hsl(173, 58%, 39%)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    return () => {
      Object.values(chartInstances.current).forEach(chart => chart.destroy());
    };
  }, [chartData]);

  if (!chartData) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Revenue Trend Chart */}
      <Card className="hover-lift" data-testid="card-revenue-chart">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <EditableText initialValue="Revenue Trend" as="h3" className="text-lg font-semibold" />
          </CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="secondary" className="bg-turquoise-100 dark:bg-turquoise-900 text-turquoise-700 dark:text-turquoise-300">
              7D
            </Button>
            <Button size="sm" variant="ghost">30D</Button>
            <Button size="sm" variant="ghost">90D</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas ref={revenueChartRef} data-testid="chart-revenue"></canvas>
          </div>
        </CardContent>
      </Card>

      {/* User Distribution Pie Chart */}
      <Card className="hover-lift" data-testid="card-distribution-chart">
        <CardHeader>
          <CardTitle>
            <EditableText initialValue="Data Distribution" as="h3" className="text-lg font-semibold" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas ref={userChartRef} data-testid="chart-distribution"></canvas>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance Bar Chart */}
      <Card className="hover-lift" data-testid="card-performance-chart">
        <CardHeader>
          <CardTitle>
            <EditableText initialValue="Category Performance" as="h3" className="text-lg font-semibold" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas ref={categoryChartRef} data-testid="chart-performance"></canvas>
          </div>
        </CardContent>
      </Card>

      {/* Overview Insights */}
      <div className="lg:col-span-2">
        <OverviewInsights data={data} />
      </div>
    </div>
  );
}
