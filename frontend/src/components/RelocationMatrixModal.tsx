import React from 'react';
import { X, Building, Download } from 'lucide-react';

interface RelocationMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RelocationMatrixModal: React.FC<RelocationMatrixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const habitationsData = [
    {
      rank: 1,
      name: 'Thalot',
      district: 'Mandi',
      chainage: '36.0 km',
      pop: 1200,
      kutchaRatio: '55.0%',
      slopeDeg: 38.5,
      inundationRisk: '56.0%',
      relocationScore: 94,
      priorityLevel: 'CRITICAL (PHASE 1)',
      priorityColor: '#ef4444',
      assignedHub: 'Pandoh Community Center Ground',
      hubElev: '830m (+80m Gain)',
      hubCapacity: 2000,
      actionDirective: 'Immediate permanent relocation. Zero post-disaster rebuild permitted on riverbed slope.'
    },
    {
      rank: 2,
      name: 'Larji',
      district: 'Mandi',
      chainage: '23.5 km',
      pop: 1800,
      kutchaRatio: '45.0%',
      slopeDeg: 36.0,
      inundationRisk: '28.0%',
      relocationScore: 82,
      priorityLevel: 'HIGH (PHASE 1)',
      priorityColor: '#f97316',
      assignedHub: 'Aut Government High School Complex',
      hubElev: '920m (+20m Gain)',
      hubCapacity: 1500,
      actionDirective: 'High-risk tributary confluence. Relocate riverbed clusters to upper Aut plateau.'
    },
    {
      rank: 3,
      name: 'Aut',
      district: 'Mandi',
      chainage: '27.0 km',
      pop: 2800,
      kutchaRatio: '35.0%',
      slopeDeg: 32.5,
      inundationRisk: '18.0%',
      relocationScore: 74,
      priorityLevel: 'MODERATE (PHASE 2)',
      priorityColor: '#eab308',
      assignedHub: 'Aut Government High School Complex',
      hubElev: '920m (+70m Gain)',
      hubCapacity: 1500,
      actionDirective: 'Aut Gorge rockfall mitigation + selective cliffside dwelling relocation.'
    },
    {
      rank: 4,
      name: 'Pandoh',
      district: 'Mandi',
      chainage: '44.5 km',
      pop: 3500,
      kutchaRatio: '30.0%',
      slopeDeg: 28.0,
      inundationRisk: '15.0%',
      relocationScore: 58,
      priorityLevel: 'WATCH (PHASE 2)',
      priorityColor: '#38bdf8',
      assignedHub: 'Pandoh Community Center Ground',
      hubElev: '830m (+50m Gain)',
      hubCapacity: 2000,
      actionDirective: 'Dam spillway surge buffer. Enforce 100m no-construction zone along riverbed.'
    },
    {
      rank: 5,
      name: 'Bhuntar',
      district: 'Kullu',
      chainage: '11.5 km',
      pop: 8500,
      kutchaRatio: '20.0%',
      slopeDeg: 19.5,
      inundationRisk: '12.0%',
      relocationScore: 32,
      priorityLevel: 'LOW (MONITORING)',
      priorityColor: '#10b981',
      assignedHub: 'Bhuntar Airport Staging Area',
      hubElev: '1110m (+14m Gain)',
      hubCapacity: 5000,
      actionDirective: 'Stable valley floor. Structural reinforcement for commercial airport corridor.'
    },
    {
      rank: 6,
      name: 'Mandi Town',
      district: 'Mandi',
      chainage: '62.0 km',
      pop: 26422,
      kutchaRatio: '15.0%',
      slopeDeg: 22.0,
      inundationRisk: '5.0%',
      relocationScore: 18,
      priorityLevel: 'STABLE (MAINTENANCE)',
      priorityColor: '#10b981',
      assignedHub: 'Mandi District Relief Hub (Paddal Ground)',
      hubElev: '760m (+50m Gain)',
      hubCapacity: 10000,
      actionDirective: 'District urban core. Maintenance of flood protection embankments at Victoria Bridge.'
    },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '920px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
        padding: '24px', position: 'relative', background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', color: '#9ca3af',
            cursor: 'pointer', padding: '4px'
          }}
        >
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building size={24} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              AI Permanent Habitation Relocation Suitability Matrix
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              State Disaster Management Authority (SDMA) &bull; Multi-Criteria Decision Analysis (MCDA) Scoring
            </div>
          </div>
        </div>

        {/* Top Formula Banner */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)',
          padding: '10px 14px', borderRadius: '8px', marginBottom: '18px',
          fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5
        }}>
          <strong>MCDA Scoring Formulation:</strong>{' '}
          <code style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
            RPI = 0.35 &times; Slope(β) + 0.25 &times; Kutcha(%) + 0.25 &times; Inundation(%) + 0.15 &times; (Elevation Delta)
          </code>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
            Weights calculated from HPSDMA 2023 disaster impact reports, Census 2011 housing vulnerability, and ISRO Cartosat DEM slope steepness.
          </div>
        </div>

        {/* Relocation Matrix Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '10px 8px' }}>Rank</th>
                <th style={{ padding: '10px 8px' }}>Habitation</th>
                <th style={{ padding: '10px 8px' }}>Population</th>
                <th style={{ padding: '10px 8px' }}>Kutcha %</th>
                <th style={{ padding: '10px 8px' }}>Slope (β)</th>
                <th style={{ padding: '10px 8px' }}>Score</th>
                <th style={{ padding: '10px 8px' }}>Assigned Relocation Hub</th>
                <th style={{ padding: '10px 8px' }}>Priority Level</th>
              </tr>
            </thead>
            <tbody>
              {habitationsData.map((hab) => (
                <tr
                  key={hab.name}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: hab.rank === 1 ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '10px 8px', fontWeight: 800, color: '#f8fafc' }}>
                    #{hab.rank}
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 700, color: '#ffffff' }}>
                    {hab.name} ({hab.district})
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Chainage: {hab.chainage}</div>
                  </td>
                  <td style={{ padding: '10px 8px', color: '#cbd5e1' }}>
                    {hab.pop.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#fb923c' }}>
                    {hab.kutchaRatio}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#cbd5e1' }}>
                    {hab.slopeDeg}&deg;
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{
                      fontWeight: 900, fontSize: '0.85rem', color: hab.priorityColor,
                      fontFamily: 'monospace'
                    }}>
                      {hab.relocationScore} / 100
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 600 }}>{hab.assignedHub}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{hab.hubElev} &bull; Cap: {hab.hubCapacity.toLocaleString()}</div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800,
                      background: `${hab.priorityColor}22`, color: hab.priorityColor, border: `1px solid ${hab.priorityColor}55`
                    }}>
                      {hab.priorityLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Directives Footer */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            <span style={{ color: '#ef4444', fontWeight: 800 }}>MANDATORY ACTION:</span> Phase 1 budget allocation prioritized for Thalot & Larji (₹18.4 Cr Relocation Grant).
          </div>
          <button
            onClick={() => window.print()}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
              background: '#1e293b', color: '#f8fafc', border: '1px solid #475569',
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>EXPORT SDMA RELOCATION REPORT (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
