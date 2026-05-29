import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Polygon,
  Line,
} from "@react-pdf/renderer";
import { type DownloadReportData } from "@/components/shared/DownloadReportButton";

const BRAND = {
  green: "#15803d",
  yellow: "#b45309",
  red: "#b91c1c",
  blue: "#1d4ed8",
  slate: "#334155",
  ink: "#0f172a",
  muted: "#475569",
  line: "#e2e8f0",
  soft: "#f8fafc",
  emerald: "#10b981",
  orange: "#f97316",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    padding: 24,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND.green,
    paddingBottom: 8,
    marginBottom: 16,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: BRAND.ink },
  headerSubtitle: { fontSize: 9, color: BRAND.muted, marginTop: 4 },
  headerMeta: { fontSize: 8, color: BRAND.slate, textAlign: "right" },
  section: { marginBottom: 16, flexShrink: 0 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: BRAND.slate,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.line,
    paddingBottom: 4,
    marginBottom: 8,
  },
  grid: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  card: { backgroundColor: BRAND.soft, padding: 10, borderRadius: 4, borderWidth: 1, borderColor: BRAND.line },
  col2: { width: "48%" },
  col3: { width: "31%" },
  col4: { width: "23%" },
  scoreBadge: { fontSize: 24, fontWeight: "bold", color: BRAND.green },
  cardTitle: { fontSize: 9, fontWeight: "bold", color: BRAND.slate, marginBottom: 4 },
  cardValue: { fontSize: 14, fontWeight: "bold", color: BRAND.ink },
  cardUnit: { fontSize: 8, color: BRAND.muted, marginTop: 2 },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: BRAND.line },
  rowLabel: { fontSize: 9, fontWeight: "bold", color: BRAND.ink, flex: 1 },
  rowValue: { fontSize: 9, fontWeight: "bold", color: BRAND.green, textAlign: "right" },
  footer: {
    position: "absolute", bottom: 20, left: 24, right: 24, borderTopWidth: 1, borderTopColor: BRAND.line, paddingTop: 10,
    display: "flex", flexDirection: "row", justifyContent: "center"
  },
  footerText: { fontSize: 8, color: BRAND.slate },
  tableHeader: { backgroundColor: BRAND.slate, color: "#fff", display: "flex", flexDirection: "row", padding: 6, fontSize: 8, fontWeight: "bold" },
  tableRow: { display: "flex", flexDirection: "row", padding: 6, borderBottomWidth: 1, borderBottomColor: BRAND.line, fontSize: 8 },
  cell1: { flex: 1 },
  cell2: { flex: 2 },
  badge: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2, fontSize: 7, color: "#fff" },
  badgeGreen: { backgroundColor: BRAND.green },
  badgeYellow: { backgroundColor: BRAND.yellow },
  badgeRed: { backgroundColor: BRAND.red },
  badgeBlue: { backgroundColor: BRAND.blue },
});

// Helper for generating radar points
const generateRadarPoints = (scores: { label: string; value: number }[]) => {
  const cx = 80; const cy = 80; const r = 60;
  const n = scores.length;
  if (n === 0) return { pts: "", lines: [] };
  const pts = scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rv = (Math.min(100, Math.max(0, s.value)) / 100) * r;
    return `${cx + rv * Math.cos(angle)},${cy + rv * Math.sin(angle)}`;
  });
  
  const lines = scores.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x1: cx, y1: cy,
      x2: cx + r * Math.cos(angle), y2: cy + r * Math.sin(angle),
    };
  });
  
  return { pts: pts.join(" "), lines };
};

const getGridPolygon = (frac: number, n: number) => {
  const cx = 80; const cy = 80; const r = 60;
  return Array.from({length: n}).map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return `${cx + frac * r * Math.cos(angle)},${cy + frac * r * Math.sin(angle)}`;
  }).join(" ");
};

const getLabelPoints = (scores: { label: string; value: number }[]) => {
  const cx = 80; const cy = 80; const r = 60;
  const n = scores.length;
  return scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + (r + 12) * Math.cos(angle), y: cy + (r + 12) * Math.sin(angle), label: s.label };
  });
};

export const VectorReportTemplate = ({ data }: { data: DownloadReportData }) => {
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const annualizedValues = data.annualizedValues ?? {
    electricity: 0,
    water: 0,
    fuel: 0,
    waste: 0,
  };
  
  const radarScores = [
    { label: "Data", value: data.completeness },
    { label: "Energy", value: data.categoryScores?.energy ?? 0 },
    { label: "Water", value: data.categoryScores?.water ?? 0 },
    { label: "Waste", value: data.categoryScores?.waste ?? 0 },
    { label: "Gov.", value: data.categoryScores?.governance ?? 0 }
  ];
  const { pts: radarPoly, lines: radarLines } = generateRadarPoints(radarScores);
  const labelPts = getLabelPoints(radarScores);
  
  return (
    <Document>
      {/* PAGE 1: EXECUTIVE SUMMARY */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>ESG Intelligence Report</Text>
            <Text style={styles.headerSubtitle}>{data.orgName ?? "Organization"} • {data.sector ?? "Healthcare"}</Text>
          </View>
          <View>
            <Text style={styles.headerMeta}>Generated on: {generatedDate}</Text>
            <Text style={styles.headerMeta}>Confidential</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.grid}>
            <View style={[styles.card, styles.col3]}>
              <Text style={styles.cardTitle}>Overall Readiness</Text>
              <Text style={[styles.scoreBadge, { color: data.overallScore > 75 ? BRAND.green : data.overallScore > 50 ? BRAND.orange : BRAND.red }]}>
                {data.overallScore} / 100
              </Text>
              <Text style={styles.cardUnit}>{data.readinessStage}</Text>
            </View>
            <View style={[styles.card, styles.col3]}>
              <Text style={styles.cardTitle}>Total Emissions</Text>
              <Text style={[styles.scoreBadge, { color: BRAND.ink }]}>{Math.round(data.totalEmissions)}</Text>
              <Text style={styles.cardUnit}>tCO₂e / year</Text>
            </View>
            <View style={[styles.card, styles.col3]}>
              <Text style={styles.cardTitle}>Data Intelligence</Text>
              <Text style={[styles.scoreBadge, { color: BRAND.blue }]}>{Math.round(data.confidence * 100)}%</Text>
              <Text style={styles.cardUnit}>Completeness: {Math.round(data.completeness)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {/* Radar Chart Column */}
          <View style={{ width: "45%" }}>
            <Text style={styles.sectionTitle}>Performance Radar</Text>
            <View style={[styles.card, { alignItems: "center", justifyContent: "center", height: 200 }]}>
              <Svg viewBox="0 0 160 160" width="160" height="160">
                {[0.25, 0.5, 0.75, 1].map(f => (
                  <Polygon key={f} points={getGridPolygon(f, radarScores.length)} fill="none" stroke="#e2e8f0" strokeWidth={0.8} />
                ))}
                {radarLines.map((l, i) => (
                  <Line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#e2e8f0" strokeWidth={0.8} />
                ))}
                {radarPoly && (
                  <Polygon points={radarPoly} fill="rgba(59,130,246,0.18)" stroke="#3b82f6" strokeWidth={1.5} />
                )}
                {labelPts.map((p, i) => (
                  <Text key={i} x={p.x} y={p.y} fill="#64748b" textAnchor="middle" style={{ fontSize: 7, fontWeight: "bold" }}>
                    {p.label}
                  </Text>
                ))}
              </Svg>
            </View>
          </View>

          {/* Categories & Emissions */}
          <View style={{ width: "52%" }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Scores</Text>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Energy</Text>
                  <Text style={[styles.rowValue, { color: BRAND.orange }]}>{Math.round(data.categoryScores?.energy ?? 0)}/100</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Water</Text>
                  <Text style={[styles.rowValue, { color: BRAND.blue }]}>{Math.round(data.categoryScores?.water ?? 0)}/100</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Waste</Text>
                  <Text style={styles.rowValue}>{Math.round(data.categoryScores?.waste ?? 0)}/100</Text>
                </View>
                <View style={[styles.row, { borderBottomWidth: 0 }]}>
                  <Text style={styles.rowLabel}>Governance</Text>
                  <Text style={[styles.rowValue, { color: BRAND.slate }]}>{Math.round(data.categoryScores?.governance ?? 0)}/100</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emissions Breakdown</Text>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Scope 1 (Direct)</Text>
                  <Text style={[styles.rowValue, { color: BRAND.red }]}>{data.emissions?.scope1.toFixed(1) ?? 0} tCO₂e</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Scope 2 (Indirect)</Text>
                  <Text style={[styles.rowValue, { color: BRAND.orange }]}>{data.emissions?.scope2.toFixed(1) ?? 0} tCO₂e</Text>
                </View>
                <View style={[styles.row, { borderBottomWidth: 0 }]}>
                  <Text style={styles.rowLabel}>Scope 3 (Value Chain)</Text>
                  <Text style={[styles.rowValue, { color: BRAND.yellow }]}>{data.emissions?.scope3.toFixed(1) ?? 0} tCO₂e</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Annualized Metrics</Text>
          <View style={styles.grid}>
            <View style={[styles.card, styles.col4]}>
              <Text style={styles.cardTitle}>Electricity</Text>
              <Text style={styles.cardValue}>{Math.round(annualizedValues.electricity).toLocaleString()}</Text>
              <Text style={styles.cardUnit}>kWh/yr</Text>
            </View>
            <View style={[styles.card, styles.col4]}>
              <Text style={styles.cardTitle}>Water</Text>
              <Text style={styles.cardValue}>{Math.round(annualizedValues.water).toLocaleString()}</Text>
              <Text style={styles.cardUnit}>KL/yr</Text>
            </View>
            <View style={[styles.card, styles.col4]}>
              <Text style={styles.cardTitle}>Fuel (DG)</Text>
              <Text style={styles.cardValue}>{Math.round(annualizedValues.fuel).toLocaleString()}</Text>
              <Text style={styles.cardUnit}>L/yr</Text>
            </View>
            <View style={[styles.card, styles.col4]}>
              <Text style={styles.cardTitle}>Waste</Text>
              <Text style={styles.cardValue}>{Math.round(annualizedValues.waste).toLocaleString()}</Text>
              <Text style={styles.cardUnit}>kg/yr</Text>
            </View>
          </View>
        </View>
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{data.orgName} ESG Sustainability Review • Generated by ESGroww</Text>
        </View>
      </Page>
      
      {/* PAGE 2: READINESS & ROADMAP */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Readiness & Action Plan</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={{ width: "48%" }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certification Readiness</Text>
              {data.certificationReadiness?.slice(0, 7).map((cert, i) => (
                <View key={i} style={[styles.row, { alignItems: "center" }]}>
                  <Text style={styles.rowLabel}>{cert.name}</Text>
                  <Text style={[styles.rowValue, { marginRight: 8, color: BRAND.ink }]}>{cert.score}</Text>
                  <Text style={[styles.badge, cert.score > 70 ? styles.badgeGreen : cert.score > 50 ? styles.badgeYellow : styles.badgeRed]}>
                    {cert.status}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Regulatory Readiness</Text>
              {data.regulatoryReadiness?.slice(0, 5).map((reg, i) => (
                <View key={i} style={[styles.row, { alignItems: "center" }]}>
                  <Text style={styles.rowLabel}>{reg.regulation}</Text>
                  <Text style={[styles.rowValue, { marginRight: 8, color: BRAND.ink }]}>{reg.readiness}%</Text>
                  <Text style={[styles.badge, reg.risk === "Low" ? styles.badgeGreen : reg.risk === "Medium" ? styles.badgeYellow : styles.badgeRed]}>
                    {reg.risk} Risk
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={{ width: "48%" }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Strengths</Text>
              {(data.strengths ?? []).slice(0, 4).map((strength, i) => (
                <View key={i} style={[styles.row, { paddingVertical: 6, borderBottomWidth: 0 }]}>
                  <Text style={[styles.rowLabel, { color: BRAND.green, fontSize: 8 }]}>✓ {strength}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Critical Gaps</Text>
              {(data.gaps ?? []).slice(0, 4).map((gap, i) => (
                <View key={i} style={[styles.row, { paddingVertical: 6, borderBottomWidth: 0 }]}>
                  <Text style={[styles.rowLabel, { color: BRAND.red, fontSize: 8 }]}>⚠ {gap.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Action Roadmap</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.cell1}>Timeline</Text>
            <Text style={styles.cell2}>Action</Text>
            <Text style={styles.cell2}>Impact</Text>
          </View>
          {data.roadmap?.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.cell1, { fontWeight: "bold", color: BRAND.blue }]}>{item.timeline}</Text>
              <Text style={[styles.cell2, { color: BRAND.ink }]}>{item.action}</Text>
              <Text style={[styles.cell2, { color: BRAND.slate, fontSize: 7 }]}>{item.impact}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{data.orgName} ESG Sustainability Review • Generated by ESGroww</Text>
        </View>
      </Page>

      {/* PAGE 3: KPI DEEP DIVE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>KPI Analysis Deep Dive</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evaluated Key Performance Indicators</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.cell1}>KPI</Text>
            <Text style={styles.cell1}>Value</Text>
            <Text style={styles.cell1}>Status</Text>
            <Text style={styles.cell1}>Target Range</Text>
            <Text style={styles.cell1}>Threshold</Text>
          </View>
          {Object.entries(data.evaluatedKpis || {}).map(([key, kpi], i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.cell1, { fontWeight: "bold" }]}>
                {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
              </Text>
              <Text style={styles.cell1}>{kpi.value !== null ? kpi.value.toFixed(2) : "N/A"}</Text>
              <Text style={[styles.cell1, { color: kpi.status.includes("Target") ? BRAND.green : kpi.status.includes("Risk") ? BRAND.red : BRAND.yellow }]}>
                {kpi.status}
              </Text>
              <Text style={[styles.cell1, { fontSize: 7, color: BRAND.slate }]}>{kpi.range}</Text>
              <Text style={[styles.cell1, { fontSize: 7, color: BRAND.slate }]}>{kpi.threshold}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{data.orgName} ESG Sustainability Review • Generated by ESGroww</Text>
        </View>
      </Page>
    </Document>
  );
};

export default VectorReportTemplate;
