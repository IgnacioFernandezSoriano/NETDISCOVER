/**
 * PDF Generator for NetDiscover Assessment Reports
 * Generates two institutional PDF reports using HTML + print API
 */

const ONE_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/108732851/74mCmCSQiyTeeGLMNvU8nA/one-for-regulators-white-crop_2d85c531.png";
const UPU_LOGO_WHITE = "https://d2xsxph8kpxj0f.cloudfront.net/108732851/74mCmCSQiyTeeGLMNvU8nA/upu-logo-white_1c7c3b1a.png";

export interface TechnicalReportData {
  institution: string;
  entityType: "regulator" | "designated_operator";
  country?: string;
  respondentName?: string;
  globalScore: number;
  maturityLevel: string;
  currentPhase: string;
  executiveSummary: string;
  phaseAnalyses: {
    slug: string;
    name: string;
    score: number;
    level: string;
    analysis: string;
    keyBarriers: string[];
    priorityActions: string[];
  }[];
  actionPlan: {
    title: string;
    description: string;
    phase: string;
    horizon: "short" | "medium" | "long";
    effort: "low" | "medium" | "high";
    impact: "low" | "medium" | "high";
  }[];
  roadmapNarrative: string;
  phaseScores: Record<string, number>;
}

export interface CommercialReportData {
  institution: string;
  entityType: "regulator" | "designated_operator";
  country?: string;
  globalScore: number;
  maturityLevel: string;
  executiveSummary: string;
  pains: {
    title: string;
    description: string;
    phase: string;
    severity: "critical" | "high" | "medium";
  }[];
  valuePropositions: {
    pain: string;
    solution: string;
    benefit: string;
    product: string;
  }[];
  proposedSolution: string;
  nextSteps: string[];
  investmentJustification: string;
}

function getScoreColor(score: number): string {
  if (score < 20) return "#DC2626";
  if (score < 40) return "#D97706";
  if (score < 60) return "#0891B2";
  if (score < 80) return "#0077C8";
  return "#059669";
}

function getHorizonLabel(h: string): string {
  if (h === "short") return "0–6 months";
  if (h === "medium") return "6–18 months";
  return "18+ months";
}

function getHorizonColor(h: string): string {
  if (h === "short") return "#059669";
  if (h === "medium") return "#0077C8";
  return "#7C3AED";
}

function getSeverityColor(s: string): string {
  if (s === "critical") return "#DC2626";
  if (s === "high") return "#D97706";
  return "#0891B2";
}

function buildRadarSVG(phaseScores: Record<string, number>): string {
  const phases = Object.entries(phaseScores);
  const n = phases.length;
  if (n === 0) return "";

  const cx = 200, cy = 200, r = 150;
  const angleStep = (2 * Math.PI) / n;

  const points = (radius: number) =>
    phases.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    }).join(" ");

  const scorePoints = phases.map(([, score], i) => {
    const angle = i * angleStep - Math.PI / 2;
    const rad = (score / 100) * r;
    return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`;
  }).join(" ");

  const gridLines = [0.25, 0.5, 0.75, 1].map(f =>
    `<polygon points="${points(r * f)}" fill="none" stroke="#E5E7EB" stroke-width="1"/>`
  ).join("");

  const axisLines = phases.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="#E5E7EB" stroke-width="1"/>`;
  }).join("");

  const labels = phases.map(([slug, score], i) => {
    const angle = i * angleStep - Math.PI / 2;
    const labelR = r + 28;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    const shortName = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).split(" ").slice(0, 2).join(" ");
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#374151" font-family="Inter,sans-serif">${shortName}</text>
    <text x="${x}" y="${y + 12}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="${getScoreColor(score)}" font-weight="bold" font-family="Inter,sans-serif">${score}%</text>`;
  }).join("");

  return `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    ${gridLines}
    ${axisLines}
    <polygon points="${scorePoints}" fill="#0A224022" stroke="#0A2240" stroke-width="2"/>
    ${phases.map(([, score], i) => {
      const angle = i * angleStep - Math.PI / 2;
      const rad = (score / 100) * r;
      return `<circle cx="${cx + rad * Math.cos(angle)}" cy="${cy + rad * Math.sin(angle)}" r="4" fill="#0A2240"/>`;
    }).join("")}
    ${labels}
  </svg>`;
}

function buildBarChart(phaseScores: Record<string, number>): string {
  const entries = Object.entries(phaseScores);
  const barHeight = 28;
  const gap = 10;
  const labelW = 160;
  const barMaxW = 300;
  const totalH = entries.length * (barHeight + gap);

  const bars = entries.map(([slug, score], i) => {
    const y = i * (barHeight + gap);
    const barW = (score / 100) * barMaxW;
    const color = getScoreColor(score);
    const name = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return `
      <text x="0" y="${y + barHeight / 2 + 4}" font-size="10" fill="#374151" font-family="Inter,sans-serif">${name}</text>
      <rect x="${labelW}" y="${y}" width="${barW}" height="${barHeight}" rx="3" fill="${color}22"/>
      <rect x="${labelW}" y="${y}" width="${barW}" height="${barHeight}" rx="3" fill="${color}" opacity="0.7"/>
      <text x="${labelW + barW + 6}" y="${y + barHeight / 2 + 4}" font-size="10" fill="${color}" font-weight="bold" font-family="Inter,sans-serif">${score}%</text>
    `;
  }).join("");

  return `<svg width="${labelW + barMaxW + 60}" height="${totalH}" viewBox="0 0 ${labelW + barMaxW + 60} ${totalH}" xmlns="http://www.w3.org/2000/svg">
    ${bars}
  </svg>`;
}

function buildRoadmapSVG(actions: TechnicalReportData["actionPlan"]): string {
  const short = actions.filter(a => a.horizon === "short");
  const medium = actions.filter(a => a.horizon === "medium");
  const long = actions.filter(a => a.horizon === "long");

  const col = (items: typeof actions, label: string, color: string, x: number) => {
    const itemsHtml = items.slice(0, 4).map((a, i) =>
      `<rect x="${x}" y="${60 + i * 44}" width="200" height="36" rx="4" fill="${color}15" stroke="${color}40" stroke-width="1"/>
       <text x="${x + 10}" y="${60 + i * 44 + 14}" font-size="8" fill="${color}" font-weight="bold" font-family="Inter,sans-serif">${a.phase}</text>
       <text x="${x + 10}" y="${60 + i * 44 + 26}" font-size="9" fill="#374151" font-family="Inter,sans-serif">${a.title.substring(0, 28)}${a.title.length > 28 ? "…" : ""}</text>`
    ).join("");
    return `
      <rect x="${x}" y="10" width="200" height="36" rx="4" fill="${color}"/>
      <text x="${x + 100}" y="32" text-anchor="middle" font-size="11" fill="white" font-weight="bold" font-family="Inter,sans-serif">${label}</text>
      ${itemsHtml}
    `;
  };

  return `<svg width="680" height="260" viewBox="0 0 680 260" xmlns="http://www.w3.org/2000/svg">
    ${col(short, "Short Term (0–6m)", "#059669", 10)}
    ${col(medium, "Medium Term (6–18m)", "#0077C8", 230)}
    ${col(long, "Long Term (18m+)", "#7C3AED", 450)}
  </svg>`;
}

export function generateTechnicalReportHTML(data: TechnicalReportData): string {
  const scoreColor = getScoreColor(data.globalScore);
  const radarSVG = buildRadarSVG(data.phaseScores);
  const barChartSVG = buildBarChart(data.phaseScores);
  const roadmapSVG = buildRoadmapSVG(data.actionPlan);
  const today = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  const phaseRows = data.phaseAnalyses.map(p => `
    <div style="margin-bottom:28px; padding:20px; border:1px solid #E5E7EB; border-radius:6px; break-inside:avoid;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div>
          <div style="font-size:11px; color:#6B7280; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Phase</div>
          <div style="font-size:16px; font-weight:700; color:#0A2240;">${p.name}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:32px; font-weight:900; color:${getScoreColor(p.score)};">${p.score}%</div>
          <div style="font-size:11px; color:${getScoreColor(p.score)}; font-weight:600;">${p.level}</div>
        </div>
      </div>
      <div style="background:#F9FAFB; border-radius:4px; padding:12px; margin-bottom:12px;">
        <div style="height:6px; background:#E5E7EB; border-radius:3px; overflow:hidden;">
          <div style="height:100%; width:${p.score}%; background:${getScoreColor(p.score)}; border-radius:3px;"></div>
        </div>
      </div>
      <p style="font-size:12px; color:#374151; line-height:1.7; margin-bottom:12px;">${p.analysis}</p>
      ${p.keyBarriers.length > 0 ? `
        <div style="margin-bottom:10px;">
          <div style="font-size:10px; font-weight:700; color:#DC2626; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;">Key Barriers</div>
          ${p.keyBarriers.map(b => `<div style="font-size:11px; color:#6B7280; padding:3px 0; padding-left:12px; border-left:2px solid #DC262640;">• ${b}</div>`).join("")}
        </div>
      ` : ""}
      ${p.priorityActions.length > 0 ? `
        <div>
          <div style="font-size:10px; font-weight:700; color:#059669; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;">Priority Actions</div>
          ${p.priorityActions.map(a => `<div style="font-size:11px; color:#374151; padding:3px 0; padding-left:12px; border-left:2px solid #05996940;">→ ${a}</div>`).join("")}
        </div>
      ` : ""}
    </div>
  `).join("");

  const actionRows = data.actionPlan.slice(0, 10).map((a, i) => `
    <tr style="border-bottom:1px solid #F3F4F6;">
      <td style="padding:10px 8px; font-size:11px; font-weight:600; color:#374151;">${i + 1}. ${a.title}</td>
      <td style="padding:10px 8px; font-size:10px; color:#6B7280;">${a.phase}</td>
      <td style="padding:10px 8px;">
        <span style="display:inline-block; padding:2px 8px; border-radius:12px; font-size:9px; font-weight:700; background:${getHorizonColor(a.horizon)}20; color:${getHorizonColor(a.horizon)};">
          ${getHorizonLabel(a.horizon)}
        </span>
      </td>
      <td style="padding:10px 8px; font-size:10px; color:#6B7280;">${a.effort.charAt(0).toUpperCase() + a.effort.slice(1)}</td>
      <td style="padding:10px 8px; font-size:10px; color:#6B7280;">${a.impact.charAt(0).toUpperCase() + a.impact.slice(1)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Postal Quality Maturity Assessment — ${data.institution}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; color:#1F2937; background:white; }
    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .page-break { page-break-before:always; }
      .no-break { break-inside:avoid; }
    }
  </style>
</head>
<body>

<!-- COVER PAGE -->
<div style="background:#0A2240; min-height:100vh; display:flex; flex-direction:column; padding:60px;">
  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:80px;">
    <img src="${ONE_LOGO}" alt="ONE for Regulators" style="height:40px; opacity:0.9;"/>
    <img src="${UPU_LOGO_WHITE}" alt="UPU" style="height:44px; opacity:0.7;"/>
  </div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
    <div style="display:inline-block; background:rgba(200,16,46,0.2); border:1px solid rgba(200,16,46,0.4); color:#F87171; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; padding:6px 14px; border-radius:20px; margin-bottom:32px; width:fit-content;">
      Regulators Community Benchmark 2026
    </div>
    <h1 style="font-size:42px; font-weight:900; color:white; line-height:1.15; letter-spacing:-0.03em; margin-bottom:16px;">
      Postal Quality Measurement<br/>Maturity Assessment
    </h1>
    <p style="font-size:16px; color:rgba(255,255,255,0.5); margin-bottom:60px; font-weight:300;">
      Diagnostic Report — ${data.institution}
    </p>
    <div style="display:flex; gap:60px; margin-bottom:80px;">
      <div>
        <div style="font-size:64px; font-weight:900; color:${scoreColor}; line-height:1;">${data.globalScore}</div>
        <div style="font-size:12px; color:rgba(255,255,255,0.4); margin-top:4px;">Global Score / 100</div>
      </div>
      <div style="border-left:1px solid rgba(255,255,255,0.1); padding-left:60px;">
        <div style="font-size:24px; font-weight:700; color:white; margin-bottom:4px;">${data.maturityLevel}</div>
        <div style="font-size:12px; color:rgba(255,255,255,0.4);">Maturity Level</div>
        <div style="margin-top:16px; font-size:14px; color:rgba(255,255,255,0.6);">${data.currentPhase}</div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:32px; display:flex; gap:40px;">
      <div>
        <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Institution</div>
        <div style="font-size:13px; color:rgba(255,255,255,0.8); font-weight:500;">${data.institution}</div>
      </div>
      ${data.entityType ? `<div>
        <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Entity Type</div>
        <div style="font-size:13px; color:rgba(255,255,255,0.8); font-weight:500;">${data.entityType === "regulator" ? "Postal Regulator" : "Designated Operator"}</div>
      </div>` : ""}
      ${data.country ? `<div>
        <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Country</div>
        <div style="font-size:13px; color:rgba(255,255,255,0.8); font-weight:500;">${data.country}</div>
      </div>` : ""}
      <div>
        <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Date</div>
        <div style="font-size:13px; color:rgba(255,255,255,0.8); font-weight:500;">${today}</div>
      </div>
    </div>
  </div>
</div>

<!-- SECTION 1: EXECUTIVE SUMMARY -->
<div class="page-break" style="padding:60px; max-width:900px; margin:0 auto;">
  <div style="margin-bottom:40px;">
    <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:8px;">Section 1</div>
    <h2 style="font-size:28px; font-weight:800; color:#0A2240; margin-bottom:6px;">Executive Summary</h2>
    <div style="width:40px; height:3px; background:#C8102E;"></div>
  </div>
  <p style="font-size:13px; color:#374151; line-height:1.8; margin-bottom:40px;">${data.executiveSummary}</p>

  <!-- Score Cards -->
  <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:40px;">
    <div style="background:#0A2240; border-radius:8px; padding:24px; text-align:center;">
      <div style="font-size:40px; font-weight:900; color:${scoreColor}; line-height:1;">${data.globalScore}</div>
      <div style="font-size:10px; color:rgba(255,255,255,0.5); margin-top:6px; text-transform:uppercase; letter-spacing:0.08em;">Global Score</div>
    </div>
    <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:24px; text-align:center;">
      <div style="font-size:18px; font-weight:800; color:#0A2240; line-height:1.2;">${data.maturityLevel}</div>
      <div style="font-size:10px; color:#6B7280; margin-top:6px; text-transform:uppercase; letter-spacing:0.08em;">Maturity Level</div>
    </div>
    <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:24px; text-align:center;">
      <div style="font-size:13px; font-weight:700; color:#0A2240; line-height:1.4;">${data.currentPhase}</div>
      <div style="font-size:10px; color:#6B7280; margin-top:6px; text-transform:uppercase; letter-spacing:0.08em;">Current Phase</div>
    </div>
  </div>

  <!-- Radar Chart -->
  <div style="background:#F9FAFB; border-radius:8px; padding:32px; text-align:center; margin-bottom:40px;">
    <div style="font-size:12px; font-weight:700; color:#0A2240; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:20px;">Maturity Profile by Phase</div>
    <div style="display:flex; justify-content:center;">${radarSVG}</div>
  </div>

  <!-- Bar Chart -->
  <div style="background:#F9FAFB; border-radius:8px; padding:32px; margin-bottom:40px;">
    <div style="font-size:12px; font-weight:700; color:#0A2240; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:20px;">Score by Phase</div>
    ${barChartSVG}
  </div>
</div>

<!-- SECTION 2: PHASE ANALYSIS -->
<div class="page-break" style="padding:60px; max-width:900px; margin:0 auto;">
  <div style="margin-bottom:40px;">
    <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:8px;">Section 2</div>
    <h2 style="font-size:28px; font-weight:800; color:#0A2240; margin-bottom:6px;">Phase-by-Phase Diagnosis</h2>
    <div style="width:40px; height:3px; background:#C8102E;"></div>
  </div>
  ${phaseRows}
</div>

<!-- SECTION 3: ACTION PLAN -->
<div class="page-break" style="padding:60px; max-width:900px; margin:0 auto;">
  <div style="margin-bottom:40px;">
    <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:8px;">Section 3</div>
    <h2 style="font-size:28px; font-weight:800; color:#0A2240; margin-bottom:6px;">Prioritised Action Plan</h2>
    <div style="width:40px; height:3px; background:#C8102E;"></div>
  </div>

  <!-- Roadmap Visual -->
  <div style="background:#F9FAFB; border-radius:8px; padding:24px; margin-bottom:32px; overflow:hidden;">
    <div style="font-size:12px; font-weight:700; color:#0A2240; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:16px;">Implementation Roadmap</div>
    ${roadmapSVG}
  </div>

  <!-- Action Table -->
  <table style="width:100%; border-collapse:collapse; font-family:'Inter',sans-serif;">
    <thead>
      <tr style="background:#0A2240;">
        <th style="padding:12px 8px; text-align:left; font-size:10px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">Action</th>
        <th style="padding:12px 8px; text-align:left; font-size:10px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">Phase</th>
        <th style="padding:12px 8px; text-align:left; font-size:10px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">Horizon</th>
        <th style="padding:12px 8px; text-align:left; font-size:10px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">Effort</th>
        <th style="padding:12px 8px; text-align:left; font-size:10px; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">Impact</th>
      </tr>
    </thead>
    <tbody>${actionRows}</tbody>
  </table>
</div>

<!-- SECTION 4: ROADMAP NARRATIVE -->
<div class="page-break" style="padding:60px; max-width:900px; margin:0 auto;">
  <div style="margin-bottom:40px;">
    <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:8px;">Section 4</div>
    <h2 style="font-size:28px; font-weight:800; color:#0A2240; margin-bottom:6px;">Recommended Roadmap</h2>
    <div style="width:40px; height:3px; background:#C8102E;"></div>
  </div>
  <div style="background:#F0F4F8; border-left:4px solid #0A2240; border-radius:0 8px 8px 0; padding:28px; margin-bottom:32px;">
    <p style="font-size:13px; color:#374151; line-height:1.8;">${data.roadmapNarrative}</p>
  </div>
</div>

<!-- FOOTER -->
<div style="background:#0A2240; padding:32px 60px; display:flex; align-items:center; justify-content:space-between;">
  <div style="display:flex; align-items:center; gap:24px;">
    <img src="${ONE_LOGO}" alt="ONE for Regulators" style="height:28px; opacity:0.7;"/>
    <img src="${UPU_LOGO_WHITE}" alt="UPU" style="height:32px; opacity:0.5;"/>
  </div>
  <div style="text-align:right;">
    <div style="font-size:10px; color:rgba(255,255,255,0.3);">This report is confidential and intended solely for ${data.institution}.</div>
    <div style="font-size:10px; color:rgba(255,255,255,0.2); margin-top:2px;">© Universal Postal Union — Regulators Community Benchmark 2026</div>
  </div>
</div>

</body>
</html>`;
}

export function generateCommercialReportHTML(data: CommercialReportData): string {
  const scoreColor = getScoreColor(data.globalScore);
  const today = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  const painCards = data.pains.map(p => `
    <div style="border:1px solid ${getSeverityColor(p.severity)}40; border-left:4px solid ${getSeverityColor(p.severity)}; border-radius:0 6px 6px 0; padding:16px; margin-bottom:12px; break-inside:avoid;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <div style="font-size:13px; font-weight:700; color:#1F2937;">${p.title}</div>
        <span style="font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; padding:3px 10px; border-radius:12px; background:${getSeverityColor(p.severity)}15; color:${getSeverityColor(p.severity)};">${p.severity}</span>
      </div>
      <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.06em; font-weight:600; margin-bottom:6px;">${p.phase}</div>
      <p style="font-size:12px; color:#6B7280; line-height:1.6;">${p.description}</p>
    </div>
  `).join("");

  const vpCards = data.valuePropositions.map(vp => `
    <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:20px; margin-bottom:16px; break-inside:avoid;">
      <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.08em; font-weight:700; margin-bottom:8px;">Pain Point</div>
      <p style="font-size:12px; color:#374151; font-weight:600; margin-bottom:12px;">${vp.pain}</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div style="background:white; border:1px solid #E5E7EB; border-radius:6px; padding:12px;">
          <div style="font-size:9px; color:#0077C8; text-transform:uppercase; letter-spacing:0.08em; font-weight:700; margin-bottom:6px;">Solution</div>
          <p style="font-size:11px; color:#374151; line-height:1.5;">${vp.solution}</p>
        </div>
        <div style="background:white; border:1px solid #E5E7EB; border-radius:6px; padding:12px;">
          <div style="font-size:9px; color:#059669; text-transform:uppercase; letter-spacing:0.08em; font-weight:700; margin-bottom:6px;">Benefit</div>
          <p style="font-size:11px; color:#374151; line-height:1.5;">${vp.benefit}</p>
        </div>
      </div>
      ${vp.product ? `<div style="margin-top:10px; padding:8px 12px; background:#0A224010; border-radius:4px; font-size:10px; color:#0A2240; font-weight:600;">📦 ${vp.product}</div>` : ""}
    </div>
  `).join("");

  const nextStepItems = data.nextSteps.map((s, i) => `
    <div style="display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid #F3F4F6;">
      <div style="width:24px; height:24px; border-radius:50%; background:#0A2240; color:white; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${i + 1}</div>
      <p style="font-size:12px; color:#374151; line-height:1.6; padding-top:2px;">${s}</p>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Action Plan — ${data.institution}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; color:#1F2937; background:white; }
    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .page-break { page-break-before:always; }
      .no-break { break-inside:avoid; }
    }
  </style>
</head>
<body>

<!-- COVER PAGE -->
<div style="background:linear-gradient(135deg, #0A2240 0%, #0D3060 100%); min-height:100vh; display:flex; flex-direction:column; padding:60px; position:relative; overflow:hidden;">
  <div style="position:absolute; top:0; right:0; width:400px; height:400px; background:rgba(200,16,46,0.08); border-radius:50%; transform:translate(100px,-100px);"></div>
  <div style="position:absolute; bottom:0; left:0; width:300px; height:300px; background:rgba(255,255,255,0.03); border-radius:50%; transform:translate(-100px,100px);"></div>
  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:80px; position:relative;">
    <img src="${ONE_LOGO}" alt="ONE for Regulators" style="height:40px; opacity:0.9;"/>
    <img src="${UPU_LOGO_WHITE}" alt="UPU" style="height:44px; opacity:0.7;"/>
  </div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; position:relative;">
    <div style="display:inline-block; background:rgba(200,16,46,0.25); border:1px solid rgba(200,16,46,0.5); color:#FCA5A5; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; padding:6px 14px; border-radius:20px; margin-bottom:32px; width:fit-content;">
      Commercial Action Plan
    </div>
    <h1 style="font-size:42px; font-weight:900; color:white; line-height:1.15; letter-spacing:-0.03em; margin-bottom:16px;">
      Improvement Roadmap &<br/>Value Proposition
    </h1>
    <p style="font-size:16px; color:rgba(255,255,255,0.5); margin-bottom:60px; font-weight:300;">
      ${data.institution} — Postal Quality Measurement
    </p>
    <div style="display:flex; gap:40px; margin-bottom:80px;">
      <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:20px 28px;">
        <div style="font-size:36px; font-weight:900; color:${scoreColor};">${data.globalScore}<span style="font-size:16px; color:rgba(255,255,255,0.3); font-weight:300;">/100</span></div>
        <div style="font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.08em; margin-top:4px;">Current Maturity</div>
      </div>
      <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:20px 28px;">
        <div style="font-size:20px; font-weight:800; color:white;">${data.maturityLevel}</div>
        <div style="font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.08em; margin-top:4px;">Maturity Level</div>
      </div>
      <div style="background:rgba(200,16,46,0.15); border:1px solid rgba(200,16,46,0.3); border-radius:8px; padding:20px 28px;">
        <div style="font-size:20px; font-weight:800; color:#FCA5A5;">${data.pains.length}</div>
        <div style="font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.08em; margin-top:4px;">Identified Challenges</div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:32px; display:flex; gap:40px;">
      <div>
        <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Institution</div>
        <div style="font-size:13px; color:rgba(255,255,255,0.8); font-weight:500;">${data.institution}</div>
      </div>
      ${data.country ? `<div>
        <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Country</div>
        <div style="font-size:13px; color:rgba(255,255,255,0.8); font-weight:500;">${data.country}</div>
      </div>` : ""}
      <div>
        <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Date</div>
        <div style="font-size:13px; color:rgba(255,255,255,0.8); font-weight:500;">${today}</div>
      </div>
    </div>
  </div>
</div>

<!-- SECTION 1: EXECUTIVE SUMMARY -->
<div class="page-break" style="padding:60px; max-width:900px; margin:0 auto;">
  <div style="margin-bottom:40px;">
    <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:8px;">Section 1</div>
    <h2 style="font-size:28px; font-weight:800; color:#0A2240; margin-bottom:6px;">Situation Analysis</h2>
    <div style="width:40px; height:3px; background:#C8102E;"></div>
  </div>
  <div style="background:#F0F4F8; border-left:4px solid #0A2240; border-radius:0 8px 8px 0; padding:28px; margin-bottom:32px;">
    <p style="font-size:13px; color:#374151; line-height:1.8;">${data.executiveSummary}</p>
  </div>
</div>

<!-- SECTION 2: PAIN POINTS -->
<div class="page-break" style="padding:60px; max-width:900px; margin:0 auto;">
  <div style="margin-bottom:40px;">
    <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:8px;">Section 2</div>
    <h2 style="font-size:28px; font-weight:800; color:#0A2240; margin-bottom:6px;">Identified Challenges</h2>
    <div style="width:40px; height:3px; background:#C8102E;"></div>
  </div>
  ${painCards}
</div>

<!-- SECTION 3: VALUE PROPOSITIONS -->
<div class="page-break" style="padding:60px; max-width:900px; margin:0 auto;">
  <div style="margin-bottom:40px;">
    <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:8px;">Section 3</div>
    <h2 style="font-size:28px; font-weight:800; color:#0A2240; margin-bottom:6px;">Value Proposition</h2>
    <div style="width:40px; height:3px; background:#C8102E;"></div>
  </div>
  ${vpCards}
</div>

<!-- SECTION 4: PROPOSED SOLUTION & NEXT STEPS -->
<div class="page-break" style="padding:60px; max-width:900px; margin:0 auto;">
  <div style="margin-bottom:40px;">
    <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:8px;">Section 4</div>
    <h2 style="font-size:28px; font-weight:800; color:#0A2240; margin-bottom:6px;">Proposed Solution</h2>
    <div style="width:40px; height:3px; background:#C8102E;"></div>
  </div>
  <div style="background:#F0F4F8; border-left:4px solid #0A2240; border-radius:0 8px 8px 0; padding:28px; margin-bottom:40px;">
    <p style="font-size:13px; color:#374151; line-height:1.8;">${data.proposedSolution}</p>
  </div>

  <div style="margin-bottom:40px;">
    <div style="font-size:10px; color:#C8102E; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:8px;">Section 5</div>
    <h2 style="font-size:28px; font-weight:800; color:#0A2240; margin-bottom:6px;">Recommended Next Steps</h2>
    <div style="width:40px; height:3px; background:#C8102E; margin-bottom:24px;"></div>
    ${nextStepItems}
  </div>

  ${data.investmentJustification ? `
  <div style="background:#0A2240; border-radius:8px; padding:28px; color:white;">
    <div style="font-size:10px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:0.1em; font-weight:700; margin-bottom:12px;">Investment Justification</div>
    <p style="font-size:13px; color:rgba(255,255,255,0.8); line-height:1.8;">${data.investmentJustification}</p>
  </div>
  ` : ""}
</div>

<!-- FOOTER -->
<div style="background:#0A2240; padding:32px 60px; display:flex; align-items:center; justify-content:space-between;">
  <div style="display:flex; align-items:center; gap:24px;">
    <img src="${ONE_LOGO}" alt="ONE for Regulators" style="height:28px; opacity:0.7;"/>
    <img src="${UPU_LOGO_WHITE}" alt="UPU" style="height:32px; opacity:0.5;"/>
  </div>
  <div style="text-align:right;">
    <div style="font-size:10px; color:rgba(255,255,255,0.3);">This document is confidential and intended solely for ${data.institution}.</div>
    <div style="font-size:10px; color:rgba(255,255,255,0.2); margin-top:2px;">© Universal Postal Union — Regulators Community Benchmark 2026</div>
  </div>
</div>

</body>
</html>`;
}

export function printHTMLAsPDF(html: string, filename: string): void {
  // Use a hidden iframe + Blob URL to avoid popup blockers
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  // Remove any previous print iframe
  const existing = document.getElementById("__nd_print_frame");
  if (existing) document.body.removeChild(existing);

  const iframe = document.createElement("iframe");
  iframe.id = "__nd_print_frame";
  iframe.style.cssText = "position:fixed;width:0;height:0;border:none;opacity:0;pointer-events:none;";
  iframe.src = url;

  iframe.onload = () => {
    try {
      if (iframe.contentDocument) {
        iframe.contentDocument.title = filename;
      }
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Clean up after print dialog closes
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 120_000);
      }, 800);
    } catch {
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  document.body.appendChild(iframe);
}
