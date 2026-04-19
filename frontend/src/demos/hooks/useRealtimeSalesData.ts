import { useState, useEffect, useMemo } from 'react';

export interface SaleDataPoint {
  time: string;
  sales: number;
}

export interface LatestPayment {
  id: string;
  amount: number;
  product: string;
  customer: string;
  time: string;
}

export const useRealtimeSalesData = () => {
  const [totalRevenue, setTotalRevenue] = useState(12850.50);
  const [salesCount, setSalesCount] = useState(452);
  const [salesChartData, setSalesChartData] = useState<SaleDataPoint[]>([]);
  const [cumulativeRevenueData, setCumulativeRevenueData] = useState<SaleDataPoint[]>([]);
  const [latestPayments, setLatestPayments] = useState<LatestPayment[]>([]);

  // Initialize with some data
  useEffect(() => {
    const now = new Date();
    const initialSales: SaleDataPoint[] = [];
    const initialCumulative: SaleDataPoint[] = [];
    let currentTotal = 12000;

    for (let i = 20; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5000);
      const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
      const sale = Math.random() * 50 + 10;
      currentTotal += sale;
      
      initialSales.push({ time: timeStr, sales: sale });
      initialCumulative.push({ time: timeStr, sales: currentTotal });
    }

    setSalesChartData(initialSales);
    setCumulativeRevenueData(initialCumulative);
    setTotalRevenue(currentTotal);

    const initialPayments: LatestPayment[] = [
      { id: '1', amount: 49.99, product: 'Pro Plan', customer: 'John Doe', time: '2 mins ago' },
      { id: '2', amount: 99.99, product: 'Enterprise', customer: 'Jane Smith', time: '5 mins ago' },
      { id: '3', amount: 19.99, product: 'Basic Plan', customer: 'Bob Wilson', time: '10 mins ago' },
      { id: '4', amount: 49.99, product: 'Pro Plan', customer: 'Alice Brown', time: '12 mins ago' },
    ];
    setLatestPayments(initialPayments);
  }, []);

  // Update real-time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      const newSale = Math.random() > 0.7 ? Math.random() * 100 + 20 : 0; // 30% chance of a sale every tick
      
      if (newSale > 0) {
        setTotalRevenue(prev => prev + newSale);
        setSalesCount(prev => prev + 1);
        
        const newPayment: LatestPayment = {
          id: Date.now().toString(),
          amount: newSale,
          product: newSale > 70 ? 'Enterprise' : newSale > 40 ? 'Pro Plan' : 'Basic Plan',
          customer: ['Alex', 'Chris', 'Jordan', 'Taylor', 'Morgan'][Math.floor(Math.random() * 5)] + ' ' + Math.floor(Math.random() * 1000),
          time: 'Just now'
        };
        
        setLatestPayments(prev => [newPayment, ...prev.slice(0, 9)]);
      }

      setSalesChartData(prev => {
        const newData = [...prev, { time: timeStr, sales: newSale }];
        return newData.slice(-30); // Keep last 30 data points
      });

      setCumulativeRevenueData(prev => {
        const lastValue = prev.length > 0 ? prev[prev.length - 1].sales : 12000;
        const newData = [...prev, { time: timeStr, sales: lastValue + newSale }];
        return newData.slice(-30);
      });

    }, 3000); // Every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const averageSale = useMemo(() => {
    return salesCount > 0 ? totalRevenue / salesCount : 0;
  }, [totalRevenue, salesCount]);

  return {
    totalRevenue,
    cumulativeRevenueData,
    salesCount,
    averageSale,
    salesChartData,
    latestPayments,
  };
};
