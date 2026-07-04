import React from 'react'
import { Map, BarChart2 } from 'lucide-react'

interface SlideIndicatorProps {
  currentPage: number
  onChange: (page: number) => void
}

export default function SlideIndicator({ currentPage, onChange }: SlideIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-6 mt-4 pb-2">
      <button 
        onClick={() => onChange(0)}
        className={`flex items-center space-x-2 transition-colors ${currentPage === 0 ? 'text-[#6D50A3] font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
        aria-label="View Map"
      >
        <Map className="w-4 h-4" />
        <span className="text-sm">Map</span>
      </button>
      <div className="w-1 h-1 rounded-full bg-gray-300" />
      <button 
        onClick={() => onChange(1)}
        className={`flex items-center space-x-2 transition-colors ${currentPage === 1 ? 'text-[#6D50A3] font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
        aria-label="View Statistics"
      >
        <BarChart2 className="w-4 h-4" />
        <span className="text-sm">Statistics</span>
      </button>
    </div>
  )
}
