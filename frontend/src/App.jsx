import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

// ── Navbar ──────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">🛡️</div>
          <div className="nav-logo-text">Docu<span>Shield</span></div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            SuRaksha Cyber Hackathon 2.0
          </div>
          <div className="nav-badge">
            <div className="nav-badge-dot" />
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────
function HeroSection({ onScrollToUpload }) {
  return (
    <section className="hero">
      <div className="hero-bg-orb hero-bg-orb-1" />
      <div className="hero-bg-orb hero-bg-orb-2" />
      <div className="hero-content">
        <div className="hero-eyebrow">
          🏦 Canara Bank × AI Forensics
        </div>
        <h1 className="hero-title">
          AI-Powered{' '}
          <span className="gradient-text">Document Integrity</span>
          {' '}Verification
        </h1>
        <p className="hero-subtitle">
          DocuShield detects forged and tampered loan documents in real-time using
          Error Level Analysis, Deep Learning, and OCR cross-checking — before
          fraud enters your underwriting pipeline.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={onScrollToUpload} id="hero-analyze-btn">
            🔍 Analyze Document
          </button>
          <a href="#features" className="btn-secondary">
            Learn How It Works
          </a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">&lt;3s</div>
            <div className="hero-stat-label">Analysis Time</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">3</div>
            <div className="hero-stat-label">Detection Layers</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">ELA</div>
            <div className="hero-stat-label">Forensic Engine</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">100%</div>
            <div className="hero-stat-label">On-Premise</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Upload Zone ───────────────────────────────────────────────────
function UploadZone({ onFileSelected }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  }, [onFileSelected]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelected(file);
  };

  return (
    <section className="upload-section" id="upload">
      <div className="container">
        <div className="upload-section-title">
          <h2>Submit Document for <span className="gradient-text">Verification</span></h2>
          <p>Upload any scanned document — our AI will detect tampering in seconds.</p>
        </div>

        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          id="upload-drop-zone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload document for analysis"
        >
          <input
            ref={inputRef}
            type="file"
            id="document-file-input"
            accept=".jpg,.jpeg,.png,.tiff,.pdf"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          <div className="upload-icon">📄</div>
          <div className="upload-title">
            {dragOver ? 'Drop to analyze →' : 'Drag & Drop your document here'}
          </div>
          <div className="upload-desc">
            Or click to browse files · Supported: Income certificates, land records, salary slips, property papers
          </div>
          <div className="upload-formats">
            {['JPEG', 'PNG', 'TIFF', 'PDF'].map(f => (
              <span key={f} className="format-tag">.{f.toLowerCase()}</span>
            ))}
            <span className="format-tag">Max 20 MB</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Analysis Progress ─────────────────────────────────────────────
function AnalysisProgress({ stage }) {
  const layers = [
    {
      id: 'ela',
      name: 'Layer 1 — Error Level Analysis',
      desc: 'Detecting pixel-level manipulation & re-compression artifacts',
      icon: '🔬'
    },
    {
      id: 'cnn',
      name: 'Layer 2 — Deep Learning (CNN)',
      desc: 'Analyzing font inconsistencies, signature & stamp irregularities',
      icon: '🧠'
    },
    {
      id: 'ocr',
      name: 'Layer 3 — OCR & NLP Cross-check',
      desc: 'Validating numeric fields, dates & cross-field contradictions',
      icon: '📝'
    }
  ];

  const stageIndex = { ela: 0, cnn: 1, ocr: 2, done: 3 };
  const current = stageIndex[stage] ?? 0;
  const progress = ((current) / 3) * 100;

  return (
    <div className="analysis-overlay">
      <div className="glass-card analysis-card">
        <div className="analysis-spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring" />
          <div className="spinner-ring" />
        </div>
        <div className="analysis-title">Analyzing Document…</div>
        <div className="analysis-subtitle">Running forensic detection pipeline</div>

        <div className="analysis-layers">
          {layers.map((layer, i) => {
            const isDone = i < current;
            const isActive = i === current;
            return (
              <div
                key={layer.id}
                className={`layer-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              >
                <div className="layer-status-icon">
                  {isDone ? '✅' : isActive ? '⚡' : layer.icon}
                </div>
                <div className="layer-info">
                  <div className="layer-name" style={{ color: isActive ? 'var(--accent-cyan)' : isDone ? 'var(--risk-low)' : 'var(--text-secondary)' }}>
                    {layer.name}
                  </div>
                  <div className="layer-desc">{layer.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="layer-progress-bar" style={{ marginTop: '28px' }}>
          <div className="layer-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

// ── Score Gauge ───────────────────────────────────────────────────
function ScoreGauge({ score, risk }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colors = {
    LOW: ['#10b981', '#34d399'],
    MEDIUM: ['#f59e0b', '#fbbf24'],
    HIGH: ['#ef4444', '#f87171']
  };
  const [c1, c2] = colors[risk] ?? ['#00d4ff', '#3b82f6'];

  const gradientId = `gauge-grad-${risk}`;

  return (
    <div className="score-gauge-wrapper">
      <svg className="score-gauge-svg" viewBox="0 0 180 180">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <circle className="gauge-bg" cx="90" cy="90" r={radius} />
        <circle
          className="gauge-fill"
          cx="90" cy="90" r={radius}
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-center">
        <div className="score-value" style={{ color: c1 }}>{score.toFixed(0)}%</div>
        <div className="score-label">Authentic</div>
      </div>
    </div>
  );
}

// ── Heatmap Viewer ────────────────────────────────────────────────
function HeatmapViewer({ heatmapBase64, filename }) {
  return (
    <div className="glass-card heatmap-card">
      <h3>🗺 Forensic Heatmap Overlay</h3>
      {heatmapBase64 ? (
        <>
          <div className="heatmap-image-wrapper">
            <img
              src={`data:image/png;base64,${heatmapBase64}`}
              alt="Forensic heatmap overlay showing tampered regions"
              id="heatmap-image"
            />
          </div>
          <div className="heatmap-legend">
            <div className="legend-dot" />
            <span>Red highlights indicate suspected tampered / re-saved regions</span>
          </div>
        </>
      ) : (
        <div className="no-anomalies">Heatmap not available for this document type.</div>
      )}
    </div>
  );
}

// ── Layer Breakdown ───────────────────────────────────────────────
function LayerBreakdown({ layers }) {
  const items = [
    { key: 'ela', icon: '🔬', name: 'Error Level Analysis', score: layers?.ela?.score ?? 0 },
    { key: 'cnn', icon: '🧠', name: 'CNN Deep Learning', score: layers?.cnn?.score ?? 0 },
    { key: 'ocr', icon: '📝', name: 'OCR + NLP Check', score: layers?.ocr?.score ?? 0 }
  ];

  const barColor = (score) => {
    if (score >= 75) return 'linear-gradient(90deg, #10b981, #34d399)';
    if (score >= 45) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #ef4444, #f87171)';
  };

  return (
    <div className="glass-card layers-card">
      <h3>Detection Layer Scores</h3>
      {items.map(item => (
        <div className="layer-row" key={item.key}>
          <div className="layer-row-icon">{item.icon}</div>
          <div className="layer-row-info">
            <div className="layer-row-name">{item.name}</div>
            <div className="layer-score-bar">
              <div
                className="layer-score-fill"
                style={{ width: `${item.score}%`, background: barColor(item.score) }}
              />
            </div>
          </div>
          <div className="layer-row-pct">{item.score.toFixed(0)}%</div>
        </div>
      ))}
    </div>
  );
}

// ── Anomaly Report ────────────────────────────────────────────────
function AnomalyReport({ layers }) {
  const anomalies = [
    ...(layers?.ela?.regions?.map(r => ({ type: 'Pixel Manipulation', detail: r.label, severity: r.confidence > 60 ? 'High' : 'Medium', layer: 'ELA' })) ?? []),
    ...(layers?.cnn?.anomalies?.map(a => ({ type: a.type, detail: `Confidence: ${a.confidence}%`, severity: a.severity, layer: 'CNN' })) ?? []),
    ...(layers?.ocr?.text_issues?.map(i => ({ type: i.type, detail: i.detail, severity: i.severity, layer: 'OCR' })) ?? [])
  ];

  return (
    <div className="glass-card anomaly-card results-grid-wide">
      <h3>📋 Anomaly Detection Report</h3>
      {anomalies.length === 0 ? (
        <div className="no-anomalies">
          ✅ No specific anomalies detected. Document appears authentic.
        </div>
      ) : (
        <table className="anomaly-table">
          <thead>
            <tr>
              <th>Layer</th>
              <th>Anomaly Type</th>
              <th>Detail</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>{a.layer}</td>
                <td style={{ fontWeight: 600 }}>{a.type}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{a.detail}</td>
                <td><span className={`severity-tag ${a.severity}`}>{a.severity}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Results Dashboard ─────────────────────────────────────────────
function ResultsDashboard({ result, onReset }) {
  const riskIcons = { LOW: '✅', MEDIUM: '⚠️', HIGH: '🚨' };
  const riskTitles = {
    LOW: 'Document appears authentic',
    MEDIUM: 'Moderate anomalies detected — manual review recommended',
    HIGH: 'High tampering probability — escalate for investigation'
  };

  return (
    <section className="results-section">
      <div className="container">
        <div className="results-header">
          <div>
            <h2>Analysis <span className="gradient-text">Complete</span></h2>
            <div className="results-meta">
              ID: {result.document_id?.slice(0, 8)}… · {result.filename} · {result.processing_time_ms}ms
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className={`risk-badge ${result.risk_level}`}>
              {riskIcons[result.risk_level]} {result.risk_level} RISK
            </div>
          </div>
        </div>

        <div className={`summary-banner ${result.risk_level}`}>
          <div className="summary-banner-icon">{riskIcons[result.risk_level]}</div>
          <div className="summary-banner-text">
            <div className="summary-banner-title">{riskTitles[result.risk_level]}</div>
            <div className="summary-banner-desc">{result.summary}</div>
          </div>
        </div>

        <div className="results-grid">
          {/* Score Card */}
          <div className="glass-card score-card">
            <ScoreGauge score={result.authenticity_score} risk={result.risk_level} />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Authenticity Score</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Combined score from all 3 detection layers
              </div>
            </div>
            <div className={`risk-badge ${result.risk_level}`}>
              {riskIcons[result.risk_level]} {result.risk_level} RISK
            </div>
          </div>

          {/* Layer Breakdown */}
          <LayerBreakdown layers={result.layers} />

          {/* Heatmap */}
          <HeatmapViewer heatmapBase64={result.heatmap_base64} filename={result.filename} />

          {/* Anomaly Table */}
          <AnomalyReport layers={result.layers} />
        </div>

        <div className="results-actions">
          <button className="btn-primary" id="analyze-another-btn" onClick={onReset}>
            📄 Analyze Another Document
          </button>
          <button
            className="btn-secondary"
            id="print-report-btn"
            onClick={() => window.print()}
          >
            🖨️ Print Report
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Features Section ──────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: '🔬',
      title: 'Error Level Analysis',
      desc: 'Re-compresses images at known quality levels and amplifies pixel differences to reveal copy-paste regions and editing artifacts invisible to the naked eye.'
    },
    {
      icon: '🧠',
      title: 'Deep Learning (CNN)',
      desc: 'Convolutional neural networks trained on bank-specific document formats detect font inconsistencies, signature anomalies, and stamp irregularities.'
    },
    {
      icon: '📝',
      title: 'OCR & NLP Cross-check',
      desc: 'Tesseract OCR extracts text which is validated for numeric consistency, date format anomalies, and cross-field contradictions using NLP rules.'
    },
    {
      icon: '🗺️',
      title: 'Visual Heatmap Output',
      desc: 'Instead of a black-box result, DocuShield produces an explainable heatmap overlaid on the document highlighting exactly which regions are suspect.'
    },
    {
      icon: '⚡',
      title: 'Real-Time Processing',
      desc: 'Full 3-layer analysis completes in under 3 seconds — results are delivered at the point of upload before any human officer reviews the document.'
    },
    {
      icon: '🔒',
      title: 'On-Premise & Private',
      desc: 'No customer data leaves the bank\'s infrastructure. DocuShield runs entirely on-premise via FastAPI, complying with RBI data privacy requirements.'
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="upload-section-title">
          <h2>How <span className="gradient-text">DocuShield</span> Works</h2>
          <p>A three-layer forensic pipeline that no forged document can bypass.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="glass-card feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-logo">🛡️ Docu<span style={{ color: 'var(--accent-cyan)' }}>Shield</span></div>
        <div className="footer-sub">AI-Powered Document Integrity Verification</div>
        <div className="footer-hackathon">
          Submitted for{' '}
          <span>SuRaksha Cyber Hackathon 2.0</span>
          {' '}·{' '}
          <span>Canara Bank × HackerEarth</span>
          {' '}·{' '}
          Team <span>Sun Rises</span>
          {' '}·{' '}
          IARE · May 2026
        </div>
      </div>
    </footer>
  );
}

// ── Main App ──────────────────────────────────────────────────────
function App() {
  const [stage, setStage] = useState('idle'); // idle | analyzing | results | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [analysisLayer, setAnalysisLayer] = useState('ela');
  const uploadRef = useRef(null);

  const scrollToUpload = () => {
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateProgress = (resolve) => {
    const layers = ['ela', 'cnn', 'ocr'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < layers.length) {
        setAnalysisLayer(layers[i]);
        i++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 900);
  };

  const handleFileSelected = async (file) => {
    setStage('analyzing');
    setError('');
    setAnalysisLayer('ela');

    const formData = new FormData();
    formData.append('file', file);

    // Start UI progress simulation alongside actual request
    const progressDone = new Promise(resolve => simulateProgress(resolve));

    try {
      const [response] = await Promise.all([
        axios.post(`${API_BASE}/api/analyze`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }),
        progressDone
      ]);

      setResult(response.data);
      setStage('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      setError(`Analysis failed: ${msg}`);
      setStage('error');
    }
  };

  const handleReset = () => {
    setStage('idle');
    setResult(null);
    setError('');
    setTimeout(scrollToUpload, 100);
  };

  return (
    <>
      <Navbar />

      {stage === 'analyzing' && <AnalysisProgress stage={analysisLayer} />}

      {stage === 'results' && result ? (
        <>
          <div style={{ paddingTop: '80px' }}>
            <ResultsDashboard result={result} onReset={handleReset} />
          </div>
          <FeaturesSection />
          <Footer />
        </>
      ) : (
        <>
          <HeroSection onScrollToUpload={scrollToUpload} />
          {stage === 'error' && (
            <div className="container" style={{ textAlign: 'center', padding: '20px 24px' }}>
              <div style={{
                display: 'inline-block',
                padding: '16px 28px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#f87171',
                fontSize: '0.9rem'
              }}>
                ❌ {error}
                <button
                  onClick={handleReset}
                  style={{ marginLeft: '16px', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Try again
                </button>
              </div>
            </div>
          )}
          <UploadZone onFileSelected={handleFileSelected} />
          <FeaturesSection />
          <Footer />
        </>
      )}
    </>
  );
}

export default App;
