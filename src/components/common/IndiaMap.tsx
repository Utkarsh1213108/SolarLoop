import React, { useState } from 'react';
import { STATE_SOLAR_PROFILES, INA_SOLAR_VERIFIED_DATA } from '../../data/researchBaseline';
import { useScenario } from '../../context/ScenarioContext';
import { Layers, MapPin, Truck, Factory, ShieldCheck, Info } from 'lucide-react';

interface IndiaMapProps {
  onSelectState?: (stateCode: string) => void;
  selectedStateCode?: string;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  onSelectState,
  selectedStateCode
}) => {
  const { selectedState, setSelectedState, inaNetworkMode, setInaNetworkMode } = useScenario();
  const [activeLayer, setActiveLayer] = useState<'generation' | 'hubs' | 'logistics' | 'density'>('generation');
  const [hoveredHub, setHoveredHub] = useState<any | null>(null);

  const activeStateCode = selectedStateCode || selectedState;

  // Geographic coordinates mapped to SVG viewbox (700 x 780)
  // India approx: Lat 8N to 36N, Lng 68E to 98E
  const mapWidth = 620;
  const mapHeight = 680;

  const projectCoords = (lat: number, lng: number) => {
    // Mercator-like normalized mapping for India
    const minLat = 7.5;
    const maxLat = 35.5;
    const minLng = 67.5;
    const maxLng = 93.0;

    const x = ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 100) + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * (mapHeight - 100) + 40;
    return { x: Math.round(x), y: Math.round(y) };
  };

  // State shapes represented as stylized clean polygons or nodal clusters
  // States with high solar penetration: RJ, GJ, KA, TN, MH, AP, MP
  const statePolygons: Record<string, { points: string; center: [number, number]; label: string; name: string }> = {
    RJ: {
      points: '120,180 180,160 230,190 220,270 170,290 120,250',
      center: [26.5, 73.5],
      label: 'RJ',
      name: 'Rajasthan'
    },
    GJ: {
      points: '80,270 140,265 170,300 170,350 110,360 80,310',
      center: [22.8, 71.5],
      label: 'GJ',
      name: 'Gujarat'
    },
    MH: {
      points: '140,350 220,330 290,370 280,440 180,450 150,380',
      center: [19.5, 75.5],
      label: 'MH',
      name: 'Maharashtra'
    },
    KA: {
      points: '160,450 220,440 240,530 190,570 160,510',
      center: [14.5, 76.0],
      label: 'KA',
      name: 'Karnataka'
    },
    AP: {
      points: '230,440 310,430 330,500 260,550 230,500',
      center: [15.8, 79.5],
      label: 'AP',
      name: 'Andhra Pradesh'
    },
    TN: {
      points: '190,560 250,550 240,640 190,650 180,600',
      center: [11.0, 78.5],
      label: 'TN',
      name: 'Tamil Nadu'
    },
    MP: {
      points: '180,270 270,250 320,300 300,340 200,340',
      center: [23.5, 78.5],
      label: 'MP',
      name: 'Madhya Pradesh'
    }
  };

  const handleStateClick = (code: string) => {
    const nextCode = activeStateCode === code ? 'ALL' : code;
    setSelectedState(nextCode);
    if (onSelectState) onSelectState(nextCode);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            National Solar Asset & Circularity Infrastructure Map
          </h3>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            Hub-and-Spoke Topology · 6 Regional Recovery Zones
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Selector */}
          <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setActiveLayer('generation')}
              className={`px-2 py-1 rounded transition-colors ${
                activeLayer === 'generation' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600'
              }`}
            >
              Waste Inflow
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('hubs')}
              className={`px-2 py-1 rounded transition-colors ${
                activeLayer === 'hubs' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600'
              }`}
            >
              Recovery Hubs
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('logistics')}
              className={`px-2 py-1 rounded transition-colors ${
                activeLayer === 'logistics' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600'
              }`}
            >
              Corridors
            </button>
          </div>

          {/* INA 700+ Network Mode Toggle */}
          <button
            type="button"
            onClick={() => setInaNetworkMode(!inaNetworkMode)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors ${
              inaNetworkMode 
                ? 'bg-teal-900 text-white border-teal-800' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>INA 700+ Reverse Logistics</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-slate-50/60 border border-slate-200 rounded-lg p-3 relative flex items-center justify-center min-h-[460px]">
          <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full max-h-[500px] h-auto select-none">
            {/* Background Country Silhouette Guide */}
            <path
              d="M170,100 L220,90 L260,130 L220,170 L260,180 L350,230 L380,290 L340,360 L360,420 L300,530 L240,650 L200,640 L160,530 L120,400 L80,330 L110,240 L120,180 Z"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* State Polygons */}
            {Object.entries(statePolygons).map(([code, poly]) => {
              const stateProfile = STATE_SOLAR_PROFILES.find(s => s.code === code);
              const isSelected = activeStateCode === code;
              const intensity = (stateProfile?.installedCapacityGW || 5) / 25; // 0 to 1

              let fillColor = '#E2E8F0';
              if (activeLayer === 'generation') {
                fillColor = isSelected ? '#0F766E' : `rgba(13, 148, 136, ${0.2 + intensity * 0.6})`;
              } else if (activeLayer === 'density') {
                fillColor = isSelected ? '#1E293B' : `rgba(30, 41, 59, ${0.15 + intensity * 0.5})`;
              } else {
                fillColor = isSelected ? '#0F766E' : '#E2E8F0';
              }

              return (
                <g key={code} className="cursor-pointer group" onClick={() => handleStateClick(code)}>
                  <polygon
                    points={poly.points}
                    fill={fillColor}
                    stroke={isSelected ? '#0F172A' : '#94A3B8'}
                    strokeWidth={isSelected ? '2.5' : '1'}
                    className="transition-colors duration-150 group-hover:opacity-90"
                  />
                  {/* State Center Label */}
                  {(() => {
                    const pt = projectCoords(poly.center[0], poly.center[1]);
                    return (
                      <text
                        x={pt.x}
                        y={pt.y}
                        textAnchor="middle"
                        className={`text-[11px] font-mono font-bold pointer-events-none ${
                          isSelected ? 'fill-white' : 'fill-slate-700'
                        }`}
                      >
                        {poly.label}
                      </text>
                    );
                  })()}
                </g>
              );
            })}

            {/* Hub-and-Spoke Logistics Corridors */}
            {activeLayer === 'logistics' && (
              <g stroke="#0D9488" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7">
                {/* Rajasthan to Gujarat Corridor */}
                <line x1="160" y1="230" x2="140" y2="310" />
                {/* Gujarat to Maharashtra Corridor */}
                <line x1="140" y1="310" x2="200" y2="390" />
                {/* Maharashtra to Karnataka Corridor */}
                <line x1="200" y1="390" x2="200" y2="500" />
                {/* Karnataka to Tamil Nadu Corridor */}
                <line x1="200" y1="500" x2="210" y2="600" />
                {/* Karnataka to Andhra Pradesh Corridor */}
                <line x1="200" y1="500" x2="260" y2="490" />
              </g>
            )}

            {/* Regional Recovery Hub Markers */}
            {STATE_SOLAR_PROFILES.map((st) => {
              const pt = projectCoords(st.coordinates[0], st.coordinates[1]);
              const isSelected = activeStateCode === st.code;

              return (
                <g
                  key={st.code}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHub(st)}
                  onMouseLeave={() => setHoveredHub(null)}
                  onClick={() => handleStateClick(st.code)}
                >
                  {/* Outer Radar pulse if selected */}
                  {isSelected && (
                    <circle cx={pt.x} cy={pt.y} r="14" fill="#0D9488" opacity="0.2" className="animate-ping" />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 7 : 5}
                    fill={isSelected ? '#0F172A' : '#0F766E'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x + 9}
                    y={pt.y + 4}
                    className="text-[9px] font-sans font-semibold fill-slate-800 pointer-events-none"
                  >
                    {st.name.slice(0, 4)} Hub
                  </text>
                </g>
              );
            })}

            {/* Optional INA 700+ Channel Partner Reverse Logistics Nodes */}
            {inaNetworkMode && (
              <g>
                {/* Verified facts: 700+ channel partners; rendered as distributed aggregation spokes across key hubs */}
                {[
                  [26.9, 75.8], [24.5, 73.7], [28.0, 73.3], // Rajasthan spokes (Jaipur, Udaipur, Bikaner)
                  [22.3, 70.8], [21.1, 72.8], [22.3, 73.1], // Gujarat spokes (Rajkot, Surat, Vadodara)
                  [12.9, 77.5], [15.3, 75.1],               // Karnataka spokes (Bengaluru, Hubballi)
                  [13.0, 80.2], [11.0, 76.9],               // Tamil Nadu spokes (Chennai, Coimbatore)
                  [19.0, 72.8], [19.8, 75.3], [21.1, 79.0]  // Maharashtra spokes (Mumbai, Aurangabad, Nagpur)
                ].map(([lat, lng], idx) => {
                  const pt = projectCoords(lat, lng);
                  return (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="2.5"
                      fill="#0284C7"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      opacity="0.85"
                    />
                  );
                })}
              </g>
            )}
          </svg>

          {/* Interactive Floating Hub Tooltip */}
          {hoveredHub && (
            <div className="absolute bottom-4 left-4 bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs max-w-xs pointer-events-none border border-slate-700">
              <div className="font-semibold text-teal-300 font-sans">{hoveredHub.name} State Profile</div>
              <div className="text-[11px] text-slate-300 mt-1 font-mono">
                <div>Primary Hub: {hoveredHub.hubLocation}</div>
                <div>Installed Capacity: {hoveredHub.installedCapacityGW} GW</div>
                <div>Est. 2040 Waste: {hoveredHub.cumulativeWaste2040Kt} kt</div>
              </div>
            </div>
          )}
        </div>

        {/* State Telemetry Detail Drawer */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {activeStateCode === 'ALL' ? 'National Overview' : `${activeStateCode} Cluster Details`}
              </span>
              {activeStateCode !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedState('ALL')}
                  className="text-[11px] text-teal-700 hover:underline font-mono"
                >
                  View All India
                </button>
              )}
            </div>

            {(() => {
              const profile = STATE_SOLAR_PROFILES.find(s => s.code === activeStateCode) || STATE_SOLAR_PROFILES[0];
              const isAll = activeStateCode === 'ALL';

              return (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-slate-500 text-[11px]">Monitored Installed Capacity</div>
                    <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      {isAll ? '85.4 GW' : `${profile.installedCapacityGW} GW`}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px]">Primary Regional Hub</div>
                    <div className="text-slate-800 font-medium">
                      {isAll ? '6 Coordinated Recovery Centers' : profile.hubLocation}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 font-mono text-[11px] tabular-nums">
                    <div>
                      <div className="text-slate-400 text-[10px]">2030 Waste (Model Output)</div>
                      <div className="font-semibold text-slate-800">
                        {isAll ? '503 kt' : `${profile.cumulativeWaste2030Kt} kt`}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">2040 Waste (Model Output)</div>
                      <div className="font-semibold text-teal-700">
                        {isAll ? '2,007 kt' : `${profile.cumulativeWaste2040Kt} kt`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* INA Reverse Logistics Context Card */}
          {inaNetworkMode && (
            <div className="p-3.5 border border-teal-200 bg-teal-50/60 rounded-lg text-xs space-y-1.5">
              <div className="font-semibold text-teal-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>INA 700+ Potential Network</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Potential reverse-logistics network: Utilizing INA Solar's 700+ verified channel partner locations as illustrative aggregation spokes for rural and commercial collection.
              </p>
              <div className="text-[10px] text-teal-800 font-mono">
                Illustrative network design · Closed-loop frame extrusion potential
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
            <strong>Illustrative network design:</strong> Hub coordinates and state routing corridors represent model-recommended planning centroids, not existing operational recycling plants. State volumes are SolarLoop model outputs.
          </div>
        </div>
      </div>
    </div>
  );
};
