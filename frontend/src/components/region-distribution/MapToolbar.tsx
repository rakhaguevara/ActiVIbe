import { Search, Download, RefreshCw } from 'lucide-react'

interface MapToolbarProps {
  onSearch: (value: string) => void
  onFilterProvince: (value: string) => void
  onFilterNGO: (value: string) => void
  onFilterEvent: (value: string) => void
  onReset: () => void
  onDownload: () => void
}

export default function MapToolbar({
  onSearch,
  onFilterProvince,
  onFilterNGO,
  onFilterEvent,
  onReset,
  onDownload,
}: MapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border-b border-gray-200">
      <div className="flex items-center flex-1 max-w-sm px-3 py-2 bg-gray-100 rounded-lg">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search region..."
          className="w-full ml-2 text-sm bg-transparent outline-none"
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search region"
        />
      </div>

      <div className="flex items-center gap-2">
        <select 
          onChange={(e) => onFilterProvince(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none cursor-pointer hover:border-gray-300 focus:ring-1 focus:ring-[#6D50A3]"
          aria-label="Filter Province"
        >
          <option value="">All Provinces</option>
          <option value="high">High Volunteer</option>
          <option value="low">Low Volunteer</option>
        </select>
        <select 
          onChange={(e) => onFilterNGO(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none cursor-pointer hover:border-gray-300 focus:ring-1 focus:ring-[#6D50A3]"
          aria-label="Filter NGO"
        >
          <option value="">All NGOs</option>
          <option value=">10">{'> 10 NGOs'}</option>
        </select>
        <select 
          onChange={(e) => onFilterEvent(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none cursor-pointer hover:border-gray-300 focus:ring-1 focus:ring-[#6D50A3]"
          aria-label="Filter Event"
        >
          <option value="">All Events</option>
          <option value=">50">{'> 50 Events'}</option>
        </select>

        <button
          onClick={onReset}
          className="p-2 text-gray-500 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700"
          aria-label="Reset View"
          title="Reset View"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={onDownload}
          className="flex items-center px-3 py-2 space-x-2 text-sm text-white transition-colors bg-[#6D50A3] rounded-lg hover:bg-[#7C63B8]"
          aria-label="Download PNG"
        >
          <Download className="w-4 h-4" />
          <span>Export PNG</span>
        </button>
      </div>
    </div>
  )
}
