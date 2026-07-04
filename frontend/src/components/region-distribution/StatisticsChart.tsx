import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { RegionStat } from '../../types/region'

interface StatisticsChartProps {
  data: RegionStat[]
  metric?: keyof RegionStat // Make it dynamic so we can swap metrics later
  title?: string
}

export default function StatisticsChart({ 
  data, 
  metric = 'volunteerCount',
  title = 'Top 10 Regions by Volunteer'
}: StatisticsChartProps) {
  
  const options = useMemo(() => {
    // Sort and get Top 10
    const sorted = [...data]
      .sort((a, b) => (b[metric] as number) - (a[metric] as number))
      .slice(0, 10)
      .reverse() // Reverse for horizontal bar chart (bottom to top)

    const names = sorted.map(d => d.name)
    const values = sorted.map(d => d[metric])

    return {
      title: {
        text: title,
        left: '4%',
        top: '2%',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#334155'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(15, 23, 42, 0.9)',
        textStyle: { color: '#f8fafc' },
        formatter: (params: any) => {
          const val = params[0]
          return `<div class="font-bold mb-1">${val.name}</div>
                  <div class="flex justify-between gap-4 text-sm">
                    <span class="text-gray-300 capitalize">${metric}</span>
                    <span class="font-bold text-white">${val.value.toLocaleString()}</span>
                  </div>`
        }
      },
      grid: {
        left: '4%',
        right: '8%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        splitLine: {
          lineStyle: { type: 'dashed', color: '#e2e8f0' }
        },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: '#475569',
          fontWeight: '500',
          margin: 12
        }
      },
      series: [
        {
          name: title,
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#6D50A3',
            borderRadius: [0, 4, 4, 0]
          },
          emphasis: {
            itemStyle: {
              color: '#7C63B8'
            }
          },
          label: {
            show: true,
            position: 'right',
            color: '#6D50A3',
            fontWeight: 'bold',
            formatter: (p: any) => p.value.toLocaleString()
          },
          barWidth: '60%'
        }
      ]
    }
  }, [data, metric, title])

  return (
    <div style={{ width: '100%', height: '100%', padding: '16px' }}>
      <ReactECharts
        option={options}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  )
}
