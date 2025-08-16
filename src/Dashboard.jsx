import React, { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import Papa from "papaparse";
import dayjs from "dayjs";
import { Upload, SlidersHorizontal, RefreshCw, FileText, BarChart3, PieChart as PieIcon, TrendingUp, Languages, Image as ImageIcon, FileDown, Plus, Trash2, Menu, Sun, Moon, FileImage, Settings, X, Save } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

/**
 * SOLAR CALOR — Interactive Client Dashboard (EN/IT)
 * vNext — Business/Marketing modes, exclusive period filters, compact CSV upload, objectives sections, terms card.
 * UX update — equal spacing, all cards collapsible, Marketing overview vs subcategory, Marketing funnel & table.
 * Implements: click-only hamburger, Marketing KPI tile layout fix, Business & Marketing overview CSV overrides,
 * and an Admin panel to edit labels, mappings, simple overrides, layout defaults + JSON export/import.
 *
 * Patch (debug):
 * - Fixes prior Unexpected token by completing HamMenu JSX and ensuring all tags/braces are closed.
 * - Keeps fix for nullish coalescing with logical ops by wrapping (a ?? b) when combined with ||/&&.
 * - Replaced `<style jsx global>` with vanilla `<style>` to avoid styled‑jsx parsing errors.
 * - Adds small self-tests for precedence & config integrity (console only).
 */

// ------------ Config & i18n ------------
const PRODUCTS = ["Riscaldamento a pavimento", "Anticalcare"];
const CATEGORIES = ["__overview__", "paid", "lp", "web", "crm"];
const DEFAULT_WEIGHTS = { time: 0.4, cta: 0.3, scroll: 0.3 };
const DEFAULT_CLV_MULTIPLIER = 1;

const I18N = {
  en: {
    title: "Client Performance Dashboard",
    product: "Product",
    channel: "Channel",
    all: "All",
    reset: "Reset",
    exportPng: "Export PNG",
    exportPdf: "Export PDF",
    uploadPaid: "Upload Paid Ads CSV",
    uploadLP: "Upload Landing Pages CSV",
    uploadWEB: "Upload Website & E-comm CSV",
    uploadCRM: "Upload CRM & Sales CSV",
    uploadBiz: "Upload Business Summary CSV",
    uploadMKTTotals: "Upload Marketing Totals CSV",
    uploadMKTDetail: "Upload Marketing Detail Table CSV",
    kpis: "KPIs",
    paidTrends: "Paid Ads Trends (CPL, CPA, ROAS)",
    lpTable: "Landing Pages — Conversion & Engagement",
    funnel: "Funnel & Sales Metrics",
    mktFunnel: "Marketing Funnel (Leads → MQL → SQL ≥3m → Customers)",
    mktTable: "Marketing KPIs — Detail Table",
    sources: "Top Traffic Sources (by Leads & CVR)",
    notes: "Notes & Next Steps",
    changeReq: "Change Requests (ICE)",
    add: "Add",
    titleCR: "Title",
    descCR: "Description",
    impact: "Impact (1–10)",
    confidence: "Confidence (1–10)",
    effort: "Effort (1–10)",
    ice: "ICE",
    status: "Status",
    open: "Open",
    planned: "Planned",
    done: "Done",
    actions: "Actions",
    uploadLogo: "Upload Logo",
    clvMult: "CLV Mult",
    weights: "Weights",
    time: "Time",
    cta: "CTA",
    scroll: "Scroll",
    category: "Category",
    paid: "Paid Ads",
    lp: "Landing Pages",
    web: "Website",
    crm: "CRM & Funnel",
    overview: "Marketing (overview)",
    mode: "View",
    marketing: "Marketing",
    business: "Business",
    period: "Period",
    month: "Month",
    quarter: "Quarter",
    year: "Year",
    selectMonth: "Select month",
    selectQuarter: "Select quarter",
    selectYear: "Select year",
    bizObjectives: "Business Objectives",
    mktObjectives: "Marketing Objectives",
    bizKpis: "Business KPIs",
    mktKpis: "Marketing KPIs",
    terms: "Terms used on dashboard — meaning",
    admin: "Admin",
    adminClose: "Close",
    adminSave: "Save",
    adminKPIs: "KPI Builder",
    adminMapping: "Data Mapping",
    adminConfig: "Config (JSON)",
    adminBackup: "Backup",
    overridden: "Overridden",
  },
  it: {
    title: "Dashboard Prestazioni Clienti",
    product: "Prodotto",
    channel: "Canale",
    all: "Tutti",
    reset: "Reimposta",
    exportPng: "Esporta PNG",
    exportPdf: "Esporta PDF",
    uploadPaid: "Carica CSV Advertising",
    uploadLP: "Carica CSV Landing Pages",
    uploadWEB: "Carica CSV Sito & E‑commerce",
    uploadCRM: "Carica CSV CRM & Vendite",
    uploadBiz: "Carica CSV Sintesi Business",
    uploadMKTTotals: "Carica CSV Totali Marketing",
    uploadMKTDetail: "Carica CSV Tabella Dettaglio Marketing",
    kpis: "KPI",
    paidTrends: "Andamento ADV (CPL, CPA, ROAS)",
    lpTable: "Landing Pages — Conversione & Engagement",
    funnel: "Funnel & Metriche Vendite",
    mktFunnel: "Funnel Marketing (Lead → MQL → SQL ≥3m → Clienti)",
    mktTable: "KPI Marketing — Tabella Dettaglio",
    sources: "Sorgenti Traffico (Lead & CVR)",
    notes: "Note & Prossimi Passi",
    changeReq: "Change Request (ICE)",
    add: "Aggiungi",
    titleCR: "Titolo",
    descCR: "Descrizione",
    impact: "Impatto (1–10)",
    confidence: "Confidenza (1–10)",
    effort: "Sforzo (1–10)",
    ice: "ICE",
    status: "Stato",
    open: "Aperto",
    planned: "Pianificato",
    done: "Fatto",
    actions: "Azioni",
    uploadLogo: "Carica Logo",
    clvMult: "Moltiplicatore CLV",
    weights: "Pesi",
    time: "Tempo",
    cta: "CTA",
    scroll: "Scroll",
    category: "Categoria",
    paid: "Advertising",
    lp: "Landing Pages",
    web: "Sito Web",
    crm: "CRM & Funnel",
    overview: "Marketing (panoramica)",
    mode: "Vista",
    marketing: "Marketing",
    business: "Business",
    period: "Periodo",
    month: "Mese",
    quarter: "Trimestre",
    year: "Anno",
    selectMonth: "Seleziona mese",
    selectQuarter: "Seleziona trimestre",
    selectYear: "Seleziona anno",
    bizObjectives: "Obiettivi Business",
    mktObjectives: "Obiettivi Marketing",
    bizKpis: "KPI Business",
    mktKpis: "KPI Marketing",
    terms: "Termini usati — significato",
    admin: "Admin",
    adminClose: "Chiudi",
    adminSave: "Salva",
    adminKPIs: "Gestione KPI",
    adminMapping: "Mappatura Dati",
    adminConfig: "Config (JSON)",
    adminBackup: "Backup",
    overridden: "Sovrascritto",
  },
};

// ------------ Utilities ------------
const toNum = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));
const fmtCur = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);
const fmtPct = (n) => `${Number.isFinite(n) ? (n * 100).toFixed(1) : "0.0"}%`;
const fmtInt = (n) => new Intl.NumberFormat("it-IT").format(Math.round(n || 0));
const parseDate = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : null);

function parseCsv(file, onDone) { Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => onDone(res.data || []) }); }
const saveLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const loadLS = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };

function mapRows(rows, mapping) {
  if (!mapping) return rows;
  return rows.map((r) => {
    const out = { ...r };
    Object.keys(mapping).forEach((std) => {
      const src = mapping[std];
      if (src && Object.prototype.hasOwnProperty.call(r, src)) out[std] = r[src];
    });
    return out;
  });
}

// ------------ DnD ------------
function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (<div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-move">{children}</div>);
}

// ------------ Sample Data ------------
const SAMPLE_PAID = [
  { date: "2025-07-01", product: PRODUCTS[0], channel: "Google", campaign: "Heat_BOFU_Italy", spend: 420, impressions: 12000, clicks: 820, leads: 30, customers: 6, revenue: 5400 },
  { date: "2025-07-01", product: PRODUCTS[1], channel: "Meta", campaign: "Anti_BOFU_IT", spend: 260, impressions: 18000, clicks: 900, leads: 40, customers: 5, revenue: 3500 },
  { date: "2025-07-08", product: PRODUCTS[0], channel: "Google", campaign: "Heat_BOFU_Italy", spend: 500, impressions: 13000, clicks: 870, leads: 32, customers: 7, revenue: 6200 },
  { date: "2025-07-08", product: PRODUCTS[1], channel: "Meta", campaign: "Anti_BOFU_IT", spend: 300, impressions: 17000, clicks: 860, leads: 37, customers: 4, revenue: 3000 },
  { date: "2025-07-15", product: PRODUCTS[0], channel: "Google", campaign: "Heat_BOFU_Italy", spend: 550, impressions: 15000, clicks: 950, leads: 34, customers: 8, revenue: 6900 },
  { date: "2025-07-15", product: PRODUCTS[1], channel: "Google", campaign: "Anti_Search_IT", spend: 280, impressions: 9000, clicks: 420, leads: 18, customers: 3, revenue: 2100 },
];
const SAMPLE_LP = [
  { date: "2025-07-01", product: PRODUCTS[0], page: "/riscaldamento-consulenza", sessions: 1200, bounces: 420, avg_time_sec: 94, cta_clicks: 260, scroll_50: 760, leads: 30 },
  { date: "2025-07-01", product: PRODUCTS[1], page: "/anticalcare-prezzo", sessions: 950, bounces: 500, avg_time_sec: 60, cta_clicks: 210, scroll_50: 540, leads: 40 },
  { date: "2025-07-08", product: PRODUCTS[0], page: "/riscaldamento-consulenza", sessions: 1300, bounces: 380, avg_time_sec: 102, cta_clicks: 290, scroll_50: 820, leads: 32 },
  { date: "2025-07-08", product: PRODUCTS[1], page: "/anticalcare-prezzo", sessions: 910, bounces: 480, avg_time_sec: 63, cta_clicks: 200, scroll_50: 520, leads: 37 },
];
const SAMPLE_WEB = [
  { date: "2025-07-01", product: PRODUCTS[0], sessions: 4800, orders: 32, revenue: 35800 },
  { date: "2025-07-01", product: PRODUCTS[1], sessions: 2100, orders: 18, revenue: 12200 },
  { date: "2025-07-08", product: PRODUCTS[0], sessions: 5200, orders: 36, revenue: 40100 },
  { date: "2025-07-08", product: PRODUCTS[1], sessions: 2000, orders: 15, revenue: 9900 },
];
const SAMPLE_CRM = [
  { lead_id: "L-1001", product: PRODUCTS[0], first_contact_date: "2025-07-02", mql_date: "2025-07-03", sql_date: "2025-07-05", call_duration_min: 4, closed_won_date: "2025-07-20", revenue: 1100 },
  { lead_id: "L-1002", product: PRODUCTS[0], first_contact_date: "2025-07-03", mql_date: "2025-07-06", sql_date: "2025-07-10", call_duration_min: 2, closed_won_date: "2025-07-28", revenue: 1300 },
  { lead_id: "L-2001", product: PRODUCTS[1], first_contact_date: "2025-07-02", mql_date: "2025-07-04", sql_date: "2025-07-06", call_duration_min: 6, closed_won_date: "2025-07-22", revenue: 700 },
];

// ------------ KPI Computations ------------
function computePaid(rows) {
  const spend = rows.reduce((s, r) => s + toNum(r.spend), 0);
  const clicks = rows.reduce((s, r) => s + toNum(r.clicks), 0);
  const impressions = rows.reduce((s, r) => s + toNum(r.impressions), 0);
  const leads = rows.reduce((s, r) => s + toNum(r.leads), 0);
  const customers = rows.reduce((s, r) => s + toNum(r.customers), 0);
  const revenue = rows.reduce((s, r) => s + toNum(r.revenue), 0);
  return { spend, clicks, impressions, leads, customers, revenue, cpl: leads ? spend / leads : 0, cpa: customers ? spend / customers : 0, roas: spend ? revenue / spend : 0, ctr: impressions ? clicks / impressions : 0, clickToLead: clicks ? leads / clicks : 0, leadToCust: leads ? customers / leads : 0 };
}
function computeLP(rows, weights = DEFAULT_WEIGHTS) {
  const byPage = {};
  for (const r of rows) {
    const key = r.page;
    if (!byPage[key]) byPage[key] = { page: r.page, sessions: 0, bounces: 0, time: 0, cta: 0, scroll50: 0, leads: 0 };
    byPage[key].sessions += toNum(r.sessions);
    byPage[key].bounces += toNum(r.bounces);
    byPage[key].time += toNum(r.avg_time_sec) * toNum(r.sessions);
    byPage[key].cta += toNum(r.cta_clicks);
    byPage[key].scroll50 += toNum(r.scroll_50);
    byPage[key].leads += toNum(r.leads);
  }
  return Object.values(byPage).map((p) => {
    const bounceRate = p.sessions ? p.bounces / p.sessions : 0;
    const timeAvg = p.sessions ? p.time / p.sessions : 0;
    const ctaCtr = p.sessions ? p.cta / p.sessions : 0;
    const scrollRate = p.sessions ? p.scroll50 / p.sessions : 0;
    const engagement = (1 - bounceRate) * weights.time + ctaCtr * weights.cta + scrollRate * weights.scroll;
    const lpCvr = p.sessions ? p.leads / p.sessions : 0;
    return { ...p, bounceRate, timeAvg, ctaCtr, scrollRate, engagement, lpCvr };
  }).sort((a, b) => b.engagement - a.engagement);
}
function computeWEB(rows) {
  const sessions = rows.reduce((s, r) => s + toNum(r.sessions), 0);
  const orders = rows.reduce((s, r) => s + toNum(r.orders), 0);
  const revenue = rows.reduce((s, r) => s + toNum(r.revenue), 0);
  return { sessions, orders, revenue, siteCR: sessions ? orders / sessions : 0, aov: orders ? revenue / orders : 0 };
}
function computeCRM(rows, clvMultiplier = DEFAULT_CLV_MULTIPLIER) {
  const totalLeads = rows.length;
  const wonRows = rows.filter((r) => r.closed_won_date);
  const mqls = rows.filter((r) => r.mql_date).length;
  const sqls = rows.filter((r) => r.sql_date).length;
  const customers = wonRows.length;
  const leadToMql = totalLeads ? mqls / totalLeads : 0;
  const mqlToSql = mqls ? sqls / mqls : 0;
  const sqlToCust = sqls ? customers / sqls : 0;
  const wonRevenue = wonRows.reduce((s, r) => s + toNum(r.revenue), 0);
  const aov = customers ? wonRevenue / customers : 0;
  const clv = aov * clvMultiplier;
  const cycles = wonRows.filter((r) => r.first_contact_date).map((r) => dayjs(r.closed_won_date).diff(dayjs(r.first_contact_date), "day"));
  const salesCycleDays = cycles.length ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0;
  return { totalLeads, mqls, sqls, customers, leadToMql, mqlToSql, sqlToCust, salesCycleDays, aov, clv, revenueTotal: wonRevenue };
}

const isSQL3 = (r) => {
  const mins = toNum(r.call_duration_min ?? r.talk_time_min ?? r.duration_min ?? r.call_minutes ?? 0);
  return !!r.sql_date && mins >= 3;
};

// ------------ Reusable UI ------------
function Card({ title, right, children, defaultOpen = true }) {
  return (
    <details open={defaultOpen} className="rounded-2xl shadow-card bg-brandCard p-5 text-brandText">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">{right}</div>
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  );
}
function Tile({ label, value, secondary, icon, badge }) {
  return (
    <div className="rounded-2xl shadow-card bg-brandCard p-4 flex items-center gap-3 text-brandText border border-brandBorder/60 min-h-[88px]">
      <div className="p-2 rounded-xl bg-brandChip shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm opacity-80 truncate" title={label}>{label}</div>
          {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brandAccent text-black">{badge}</span>}
        </div>
        <div className="text-2xl font-semibold leading-tight">{value}</div>
        {secondary && <div className="text-xs opacity-70 mt-1">{secondary}</div>}
      </div>
    </div>
  );
}
function HeaderUpload({ label, onLoad }) {
  const ref = useRef();
  return (
    <>
      <input aria-label={label} title={label} ref={ref} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files && parseCsv(e.target.files[0], onLoad)} />
      <button onClick={() => ref.current?.click()} className="px-3 py-2 rounded-lg bg-brandInput border border-brandBorder text-brandText text-sm inline-flex items-center gap-2">
        <Upload className="w-4 h-4" /> CSV
      </button>
    </>
  );
}

// ------------ Admin Panel ------------
function AdminPanel({ open, onClose, t, config, setConfig, lastHeaders }) {
  const [tab, setTab] = useState("kpis");
  const [draft, setDraft] = useState(JSON.stringify(config, null, 2));
  useEffect(()=>{ setDraft(JSON.stringify(config, null, 2)); }, [config, open]);

  function saveDraft(){ try{ const parsed = JSON.parse(draft); setConfig(parsed); } catch(e){ alert("Invalid JSON"); } }

  const dsList = ["paid","lp","web","crm","biz","mktTotals","mktDetail"];
  function MappingForm({ ds }){
    const mapping = config.mappings?.[ds] || {};
    const headers = lastHeaders[ds] || [];
    const [localMap, setLocalMap] = useState(mapping);
    useEffect(()=> setLocalMap(mapping), [mapping]);
    function setOne(k, v){ const next = { ...localMap, [k]: v }; setLocalMap(next); setConfig({ ...config, mappings: { ...config.mappings, [ds]: next } }); }
    const fields = {
      paid: ["date","product","channel","campaign","spend","impressions","clicks","leads","customers","revenue"],
      lp: ["date","product","page","sessions","bounces","avg_time_sec","cta_clicks","scroll_50","leads"],
      web: ["date","product","sessions","orders","revenue"],
      crm: ["lead_id","product","first_contact_date","mql_date","sql_date","call_duration_min","closed_won_date","revenue"],
      biz: ["period_type","period_value","product","revenue","spend","customers","profit","roas","margin_pct","objectives"],
      mktTotals: ["period_type","period_value","product","leads","mql","sql_3min","customers"],
      mktDetail: ["*any columns preserved*"]
    }[ds];
    return (
      <div className="space-y-2">
        <div className="text-sm opacity-80">Dataset: <span className="font-mono">{ds}</span></div>
        {fields.map((f)=> (
          <div key={f} className="flex items-center gap-2">
            <div className="w-52 text-sm">{f}</div>
            <select value={localMap[f]||""} onChange={(e)=>setOne(f, e.target.value)} className="flex-1 px-2 py-1 rounded bg-brandInput border border-brandBorder">
              <option value="">(same as header)</option>
              {headers.map((h)=> (<option key={h} value={h}>{h}</option>))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${open?"":"pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/50 transition ${open?"opacity-100":"opacity-0"}`} onClick={onClose}></div>
      <div className={`absolute right-0 top-0 h-full w-full max-w-3xl bg-brandCard border-l border-brandBorder shadow-card transition-transform ${open?"translate-x-0":"translate-x-full"}`}>
        <div className="p-4 border-b border-brandBorder flex items-center justify-between">
          <div className="text-lg font-semibold flex items-center gap-2"><Settings className="w-5 h-5"/>{t.admin}</div>
          <div className="flex items-center gap-2">
            <button onClick={saveDraft} className="px-3 py-2 rounded bg-brandAccent text-black inline-flex items-center gap-2"><Save className="w-4 h-4"/>{t.adminSave}</button>
            <button onClick={onClose} className="px-3 py-2 rounded bg-brandChip inline-flex items-center gap-2"><X className="w-4 h-4"/>{t.adminClose}</button>
          </div>
        </div>
        <div className="p-4 flex gap-4 h-[calc(100%-56px)]">
          <div className="w-40 flex-shrink-0 space-y-2">
            <button onClick={()=>setTab("kpis")} className={`w-full text-left px-3 py-2 rounded ${tab==="kpis"?"bg-brandAccent text-black":"bg-brandChip"}`}>{t.adminKPIs}</button>
            <button onClick={()=>setTab("mapping")} className={`w-full text-left px-3 py-2 rounded ${tab==="mapping"?"bg-brandAccent text-black":"bg-brandChip"}`}>{t.adminMapping}</button>
            <button onClick={()=>setTab("config")} className={`w-full text-left px-3 py-2 rounded ${tab==="config"?"bg-brandAccent text-black":"bg-brandChip"}`}>{t.adminConfig}</button>
            <button onClick={()=>setTab("backup")} className={`w-full text-left px-3 py-2 rounded ${tab==="backup"?"bg-brandAccent text-black":"bg-brandChip"}`}>{t.adminBackup}</button>
          </div>
          <div className="flex-1 overflow-auto pr-2">
            {tab === "kpis" && (
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-semibold mb-2">Business KPIs (labels & manual overrides for current product/period)</div>
                  <KpiEditor scope="business" t={t} config={config} setConfig={setConfig} />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Marketing Overview KPIs (labels & manual overrides for current product/period)</div>
                  <KpiEditor scope="marketing" t={t} config={config} setConfig={setConfig} />
                </div>
              </div>
            )}
            {tab === "mapping" && (
              <div className="space-y-6">
                {dsList.map((ds)=> (
                  <div key={ds} className="rounded-xl border border-brandBorder p-3">
                    <MappingForm ds={ds}/>
                  </div>
                ))}
              </div>
            )}
            {tab === "config" && (
              <div className="space-y-3">
                <textarea value={draft} onChange={(e)=>setDraft(e.target.value)} className="w-full h-[420px] bg-brandInput border border-brandBorder rounded p-3 font-mono text-sm"/>
                <div className="text-xs opacity-70">Edit advanced configuration (labels, orders, formats). Click Save to apply.</div>
              </div>
            )}
            {tab === "backup" && (
              <BackupPanel config={config} setConfig={setConfig} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiEditor({ scope, t, config, setConfig }){
  const key = scope === 'business' ? 'business' : 'marketing';
  const labels = config.kpiLabels?.[key] || {};
  const overrides = config.kpiOverrides?.[key] || {};
  const [localLabels, setLocalLabels] = useState(labels);
  const [localOverrides, setLocalOverrides] = useState(overrides);
  useEffect(()=>{ setLocalLabels(labels); setLocalOverrides(overrides); }, [labels, overrides, scope]);

  function updateLabel(k, v){ const next = { ...localLabels, [k]: v }; setLocalLabels(next); setConfig({ ...config, kpiLabels: { ...config.kpiLabels, [key]: next } }); }
  function updateOverride(k, v){ const next = { ...localOverrides, [k]: v }; setLocalOverrides(next); setConfig({ ...config, kpiOverrides: { ...config.kpiOverrides, [key]: next } }); }

  const fields = scope==='business' ? ["revenue","spend","profit","roas","margin","customers"] : ["leads","mql","sql3","customers"];

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {fields.map((f)=> (
        <div key={f} className="rounded-xl border border-brandBorder p-3 space-y-2">
          <div className="text-sm">Label</div>
          <input value={localLabels[f]||''} onChange={(e)=>updateLabel(f, e.target.value)} placeholder={`Rename ${f}`} className="w-full px-2 py-1 rounded bg-brandInput border border-brandBorder"/>
          <div className="text-sm mt-2">Manual override (number; leave blank to compute)</div>
          <input value={localOverrides[f]??''} onChange={(e)=>updateOverride(f, e.target.value===''
            ?null:Number(e.target.value))} placeholder="e.g., 123" className="w-full px-2 py-1 rounded bg-brandInput border border-brandBorder"/>
        </div>
      ))}
    </div>
  );
}

function BackupPanel({ config, setConfig }){
  function exportJSON(){ const blob = new Blob([JSON.stringify(config,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`solarcalor_dashboard_config_${dayjs().format('YYYYMMDD_HHmm')}.json`; a.click(); URL.revokeObjectURL(url); }
  function importJSON(e){ const f=e.target.files?.[0]; if(!f) return; const reader=new FileReader(); reader.onload=()=>{ try{ const parsed=JSON.parse(reader.result); setConfig(parsed); }catch{ alert('Invalid JSON'); } }; reader.readAsText(f); }
  return (
    <div className="space-y-3">
      <button onClick={exportJSON} className="px-3 py-2 rounded bg-brandAccent text-black">Export Config</button>
      <label className="px-3 py-2 rounded bg-brandChip inline-block cursor-pointer">Import Config<input type="file" accept="application/json" className="hidden" onChange={importJSON}/></label>
      <div className="text-xs opacity-70">Exports/imports only the configuration (labels, mappings, overrides, layout defaults).</div>
    </div>
  );
}

// ------------ Main Component ------------
export default function Dashboard() {
  const [lang, setLang] = useState(loadLS("lang", "it"));
  useEffect(() => saveLS("lang", lang), [lang]);
  const t = I18N[lang];

  const [logo, setLogo] = useState(loadLS("logo", ""));
  const [clientName, setClientName] = useState(loadLS("clientName", "Solar Calor"));
  function onLogo(e) { const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = () => { setLogo(reader.result); saveLS("logo", reader.result); }; reader.readAsDataURL(f); }

  const [theme, setTheme] = useState(loadLS("theme", "dark"));
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); saveLS("theme", theme); }, [theme]);

  const defaultConfig = {
    kpiLabels: {
      business: { revenue: "Revenue", spend: "Spend", profit: "Profit", roas: "ROAS", margin: "Margin", customers: "Customers" },
      marketing: { leads: "Leads", mql: "MQL", sql3: "SQL ≥3m", customers: "Total Customers" }
    },
    kpiOverrides: { business: {}, marketing: {} },
    mappings: { paid:{}, lp:{}, web:{}, crm:{}, biz:{}, mktTotals:{}, mktDetail:{} },
    layout: { paid:["kpis","paidChart","sources","notes","change"], lp:["kpis","lpTable","notes","change"], web:["kpis","webCard","notes","change"], crm:["kpis","crmFunnel","notes","change"] },
  };
  const [config, setConfig] = useState(loadLS('dashboardConfig', defaultConfig));
  useEffect(()=> saveLS('dashboardConfig', config), [config]);

  const [lastHeaders, setLastHeaders] = useState(loadLS('lastHeaders', {paid:[],lp:[],web:[],crm:[],biz:[],mktTotals:[],mktDetail:[]}));
  useEffect(()=> saveLS('lastHeaders', lastHeaders), [lastHeaders]);

  const [paidRowsRaw, setPaidRowsRaw] = useState(loadLS("paidRows", SAMPLE_PAID));
  const [lpRowsRaw, setLpRowsRaw] = useState(loadLS("lpRows", SAMPLE_LP));
  const [webRowsRaw, setWebRowsRaw] = useState(loadLS("webRows", SAMPLE_WEB));
  const [crmRowsRaw, setCrmRowsRaw] = useState(loadLS("crmRows", SAMPLE_CRM));

  const paidRows = useMemo(()=> mapRows(paidRowsRaw, config.mappings.paid), [paidRowsRaw, config.mappings]);
  const lpRows   = useMemo(()=> mapRows(lpRowsRaw,   config.mappings.lp),   [lpRowsRaw,   config.mappings]);
  const webRows  = useMemo(()=> mapRows(webRowsRaw,  config.mappings.web),  [webRowsRaw,  config.mappings]);
  const crmRows  = useMemo(()=> mapRows(crmRowsRaw,  config.mappings.crm),  [crmRowsRaw,  config.mappings]);

  const [bizOverrideRaw, setBizOverrideRaw] = useState(loadLS('bizOverride', []));
  const [mktTotalsRaw, setMktTotalsRaw] = useState(loadLS('mktTotals', []));
  const [mktDetailOverride, setMktDetailOverride] = useState(loadLS('mktDetailTable', []));

  useEffect(()=> saveLS('paidRows', paidRowsRaw), [paidRowsRaw]);
  useEffect(()=> saveLS('lpRows', lpRowsRaw), [lpRowsRaw]);
  useEffect(()=> saveLS('webRows', webRowsRaw), [webRowsRaw]);
  useEffect(()=> saveLS('crmRows', crmRowsRaw), [crmRowsRaw]);
  useEffect(()=> saveLS('bizOverride', bizOverrideRaw), [bizOverrideRaw]);
  useEffect(()=> saveLS('mktTotals', mktTotalsRaw), [mktTotalsRaw]);
  useEffect(()=> saveLS('mktDetailTable', mktDetailOverride), [mktDetailOverride]);

  const [product, setProduct] = useState(PRODUCTS[0]);
  const [mode, setMode] = useState(loadLS("mode", "marketing"));
  const [category, setCategory] = useState(loadLS("category", "__overview__"));
  const [channel, setChannel] = useState(loadLS("channel", "__ALL__"));
  const now = dayjs();
  const [periodType, setPeriodType] = useState(loadLS("periodType", "month"));
  const [periodMonth, setPeriodMonth] = useState(loadLS("periodMonth", now.format("YYYY-MM")));
  const [periodQuarter, setPeriodQuarter] = useState(loadLS("periodQuarter", `${now.year()}-Q${Math.ceil((now.month()+1)/3)}`));
  const [periodYear, setPeriodYear] = useState(loadLS("periodYear", `${now.year()}`));

  const [weights, setWeights] = useState(loadLS("engWeights", DEFAULT_WEIGHTS));
  const [clvMult, setClvMult] = useState(loadLS("clvMultiplier", DEFAULT_CLV_MULTIPLIER));
  const [notes, setNotes] = useState(loadLS("notes", ""));

  const [bizObjMap, setBizObjMap] = useState(loadLS("bizObjectives", {}));
  const [mktObjMap, setMktObjMap] = useState(loadLS("mktObjectives", {}));

  useEffect(() => saveLS("engWeights", weights), [weights]);
  useEffect(() => saveLS("clvMultiplier", clvMult), [clvMult]);
  useEffect(() => saveLS("notes", notes), [notes]);
  useEffect(() => saveLS("clientName", clientName), [clientName]);
  useEffect(() => saveLS("mode", mode), [mode]);
  useEffect(() => saveLS("category", category), [category]);
  useEffect(() => saveLS("channel", channel), [channel]);
  useEffect(() => saveLS("periodType", periodType), [periodType]);
  useEffect(() => saveLS("periodMonth", periodMonth), [periodMonth]);
  useEffect(() => saveLS("periodQuarter", periodQuarter), [periodQuarter]);
  useEffect(() => saveLS("periodYear", periodYear), [periodYear]);

  function getQuarterFromDate(d) { return Math.floor(d.month() / 3) + 1; }
  function periodKey() {
    if (periodType === "month") return `M-${periodMonth}`;
    if (periodType === "quarter") return `Q-${periodQuarter}`;
    return `Y-${periodYear}`;
  }
  function inPeriodDate(dateStr) {
    const d = dayjs(dateStr);
    if (!d.isValid()) return false;
    if (periodType === "month") {
      const [y, m] = periodMonth.split("-");
      return d.year() === Number(y) && d.month() + 1 === Number(m);
    }
    if (periodType === "quarter") {
      const [y, qLabel] = periodQuarter.split("-Q");
      const q = Number(qLabel);
      return d.year() === Number(y) && getQuarterFromDate(d) === q;
    }
    return d.year() === Number(periodYear);
  }

  const channels = useMemo(() => {
    const uniq = Array.from(new Set(paidRows.map((r) => r.channel)));
    return [{ value: "__ALL__", label: t.all }, ...uniq.map((c) => ({ value: c, label: c }))];
  }, [paidRows, t.all]);

  const paidFiltered = useMemo(() => paidRows.filter((r) => r.product === product && inPeriodDate(r.date) && (mode === "business" || channel === "__ALL__" || r.channel === channel)), [paidRows, product, channel, periodType, periodMonth, periodQuarter, periodYear, mode]);
  const lpFiltered = useMemo(() => lpRows.filter((r) => r.product === product && inPeriodDate(r.date)), [lpRows, product, periodType, periodMonth, periodQuarter, periodYear]);
  const webFiltered = useMemo(() => webRows.filter((r) => r.product === product && inPeriodDate(r.date)), [webRows, product, periodType, periodMonth, periodQuarter, periodYear]);
  const crmFiltered = useMemo(() => crmRows.filter((r) => r.product === product && inPeriodDate(r.first_contact_date)), [crmRows, product, periodType, periodMonth, periodQuarter, periodYear]);

  const paid = useMemo(() => computePaid(paidFiltered), [paidFiltered]);
  const lps = useMemo(() => computeLP(lpFiltered, weights), [lpFiltered, weights]);
  const web = useMemo(() => computeWEB(webFiltered), [webFiltered]);
  const crm = useMemo(() => computeCRM(crmFiltered, clvMult), [crmFiltered, clvMult]);

  const series = useMemo(() => {
    const groups = {};
    for (const r of paidFiltered) {
      const key = parseDate(r.date);
      if (!groups[key]) groups[key] = { date: key, spend: 0, leads: 0, customers: 0, revenue: 0, clicks: 0 };
      groups[key].spend += toNum(r.spend);
      groups[key].leads += toNum(r.leads);
      groups[key].customers += toNum(r.customers);
      groups[key].revenue += toNum(r.revenue);
      groups[key].clicks += toNum(r.clicks);
    }
    return Object.values(groups).sort((a, b) => (a.date > b.date ? 1 : -1)).map((d) => ({ ...d, cpl: d.leads ? d.spend / d.leads : 0, cpa: d.customers ? d.spend / d.customers : 0, roas: d.spend ? d.revenue / d.spend : 0 }));
  }, [paidFiltered]);

  const [adminOpen, setAdminOpen] = useState(false);

  const mktLeadsComputed = crm.totalLeads;
  const mktMQLComputed = crm.mqls;
  const mktSQL3Computed = useMemo(() => { const n = crmFiltered.filter(isSQL3).length; return n || crm.sqls; }, [crmFiltered, crm.sqls]);
  const mktCustomersComputed = crm.customers;

  function matchRowByPeriod(rows, prod){
    const keyType = periodType;
    const keyVal = keyType==='month'? periodMonth : (keyType==='quarter'? periodQuarter : periodYear);
    return rows.find(r => (r.product===prod) && (String(r.period_type||'').toLowerCase()===keyType) && (String(r.period_value||'')===keyVal));
  }
  const mktTotalsMatch = matchRowByPeriod(mapRows(mktTotalsRaw, config.mappings.mktTotals), product) || {};
  const mktOverridesManual = config.kpiOverrides?.marketing || {};
  const mktLeads = (mktOverridesManual.leads ?? toNum(mktTotalsMatch.leads)) || mktLeadsComputed;
  const mktMQL = (mktOverridesManual.mql ?? toNum(mktTotalsMatch.mql)) || mktMQLComputed;
  const mktSQL3 = (mktOverridesManual.sql3 ?? toNum(mktTotalsMatch.sql_3min)) || mktSQL3Computed;
  const mktCustomers = (mktOverridesManual.customers ?? toNum(mktTotalsMatch.customers)) || mktCustomersComputed;

  const mktLabels = config.kpiLabels?.marketing || {};

  const mktFunnelData = [
    { name: mktLabels.leads || "Leads", v: mktLeads },
    { name: mktLabels.mql || "MQL", v: mktMQL },
    { name: mktLabels.sql3 || "SQL ≥3m", v: mktSQL3 },
    { name: mktLabels.customers || "Customers", v: mktCustomers },
  ];

  const mktDetailIsOverride = Array.isArray(mktDetailOverride) && mktDetailOverride.length > 0;
  const mktTableDataComputed = useMemo(() => {
    const bucketFor = (d) => (periodType === 'month' ? dayjs(d).format('YYYY-MM-DD') : dayjs(d).format('YYYY-MM'));
    const map = new Map();
    for (const r of crmFiltered) {
      const b = bucketFor(r.first_contact_date);
      if (!map.has(b)) map.set(b, { bucket: b, leads: 0, mql: 0, sql3: 0, customers: 0 });
      const row = map.get(b);
      row.leads += 1;
      if (r.mql_date) row.mql += 1;
      if (isSQL3(r)) row.sql3 += 1;
      if (r.closed_won_date) row.customers += 1;
    }
    const arr = Array.from(map.values()).sort((a,b)=> a.bucket.localeCompare(b.bucket));
    return arr.map((r)=> ({ ...r, l2m: r.leads ? r.mql/r.leads : 0, m2s: r.mql ? r.sql3/r.mql : 0, s2c: r.sql3 ? r.customers/r.sql3 : 0 }));
  }, [crmFiltered, periodType]);

  const bizMatch = matchRowByPeriod(mapRows(bizOverrideRaw, config.mappings.biz), product) || {};
  const revenueBiz = toNum(bizMatch.revenue) || (web.revenue>0?web.revenue:crm.revenueTotal);
  const spendBiz = toNum(bizMatch.spend) || paid.spend;
  const customersBiz = toNum(bizMatch.customers) || (web.orders>0?web.orders:crm.customers);
  const profitBiz = toNum(bizMatch.profit) || Math.max(0, revenueBiz - spendBiz);
  const roasBiz = toNum(bizMatch.roas) || (spendBiz? revenueBiz/spendBiz : 0);
  const marginBiz = toNum(bizMatch.margin_pct) || (revenueBiz? profitBiz/revenueBiz : 0);
  const bizLabels = config.kpiLabels?.business || {};

  const rootRef = useRef(null);
  async function exportPNG() { if (!rootRef.current) return; const dataUrl = await toPng(rootRef.current, { cacheBust: true, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--brand-bg") || "#1B2622" }); const a = document.createElement("a"); a.href = dataUrl; a.download = `solarcalor_dashboard_${dayjs().format("YYYYMMDD_HHmm")}.png`; a.click(); }
  function exportPDF() { if (!rootRef.current) return; toPng(rootRef.current, { cacheBust: true, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--brand-bg") || "#1B2622" }).then((dataUrl) => { const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [rootRef.current.clientWidth, rootRef.current.clientHeight] }); pdf.addImage(dataUrl, "PNG", 0, 0, rootRef.current.clientWidth, rootRef.current.clientHeight); pdf.save(`solarcalor_dashboard_${dayjs().format("YYYYMMDD_HHmm")}.pdf`); }); }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const defaultOrder = config.layout || { paid: ["kpis", "paidChart", "sources", "notes", "change"], lp: ["kpis", "lpTable", "notes", "change"], web: ["kpis", "webCard", "notes", "change"], crm: ["kpis", "crmFunnel", "notes", "change"] };
  const [items, setItems] = useState(() => { const v = loadLS("widgetsOrder", defaultOrder); if (Array.isArray(v)) { const migrated = { paid: v, lp: v, web: v, crm: v }; saveLS("widgetsOrder", migrated); return migrated; } const fixed = { ...defaultOrder, ...v }; for (const k of ["paid","lp","web","crm"]) { if (!Array.isArray(fixed[k]) || fixed[k].length === 0) fixed[k] = defaultOrder[k]; } saveLS("widgetsOrder", fixed); return fixed; });
  useEffect(() => saveLS("widgetsOrder", items), [items]);
  function onDragEnd(event) { const { active, over } = event; if (!over || active.id === over.id) return; setItems((prev) => { const current = Array.isArray(prev?.[category]) ? prev[category] : defaultOrder[category]; const oldIndex = Math.max(0, current.indexOf(active.id)); const newIndex = Math.max(0, current.indexOf(over.id)); const nextList = arrayMove(current, oldIndex, newIndex); const next = { ...prev, [category]: nextList }; saveLS("widgetsOrder", next); return next; }); }
  const currentOrder = items?.[category] || defaultOrder[category] || [];

  const [cr, setCR] = useState(loadLS("changeRequests", []));
  useEffect(()=>{ const sync = ()=> setCR(loadLS("changeRequests", [])); window.addEventListener('storage', sync); return ()=> window.removeEventListener('storage', sync); },[]);
  const delCR = (idx)=>{ const next = cr.filter((_,i)=>i!==idx); setCR(next); saveLS("changeRequests", next); };

  function HamMenu() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const langToggle = () => setLang(lang === "it" ? "en" : "it");
    useEffect(()=>{
      function onDocClick(e){ if(open && menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); }
      function onEsc(e){ if(e.key==='Escape') setOpen(false); }
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onEsc);
      return ()=>{ document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onEsc); };
    }, [open]);
    return (
      <div className="relative" ref={menuRef}>
        <button onClick={() => setOpen((v) => !v)} className="p-2 rounded-lg bg-brandChip text-brandText flex items-center"><Menu className="w-5 h-5"/></button>
        <div className={`absolute left-0 mt-2 w-80 z-30 rounded-2xl shadow-card bg-brandCard border border-brandBorder p-3 transition ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded bg-brandChip overflow-hidden flex items-center justify-center">{logo ? <img src={logo} alt="logo"/> : <ImageIcon className="w-4 h-4"/>}</div>
            <input value={clientName} onChange={(e)=>setClientName(e.target.value)} className="flex-1 px-2 py-1 rounded bg-brandInput border border-brandBorder" placeholder="Client name" />
          </div>
          <div className="grid gap-2">
            <button onClick={langToggle} className="px-3 py-2 rounded bg-brandChip text-left flex items-center gap-2"><Languages className="w-4 h-4"/>{lang.toUpperCase()}</button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark" )} className="px-3 py-2 rounded bg-brandChip text-left flex items-center gap-2">{theme === "dark" ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}{theme === "dark" ? "Light mode" : "Dark mode"}</button>
            <label className="px-3 py-2 rounded bg-brandChip text-left flex items-center gap-2 cursor-pointer"><FileImage className="w-4 h-4"/>{t.uploadLogo}<input type="file" accept="image/*" onChange={onLogo} className="hidden"/></label>
            <div className="border-t border-brandBorder my-1"></div>
            <div className="text-xs opacity-70 px-1">Data uploads</div>
            {mode === 'business' && <HeaderUpload label={t.uploadBiz} onLoad={(rows)=>{ setBizOverrideRaw(rows); setLastHeaders((p)=>({...p, biz: Object.keys(rows[0]||{})})); }} />}
            {mode === 'marketing' && category==='__overview__' && (
              <>
                <HeaderUpload label={t.uploadMKTTotals} onLoad={(rows)=>{ setMktTotalsRaw(rows); setLastHeaders((p)=>({...p, mktTotals: Object.keys(rows[0]||{})})); }} />
                <HeaderUpload label={t.uploadMKTDetail} onLoad={(rows)=>{ setMktDetailOverride(rows); setLastHeaders((p)=>({...p, mktDetail: Object.keys(rows[0]||{})})); }} />
              </>
            )}
            {mode === 'marketing' && category==='paid' && <HeaderUpload label={t.uploadPaid} onLoad={(rows)=>{ setPaidRowsRaw(rows); setLastHeaders((p)=>({...p, paid: Object.keys(rows[0]||{})})); }} />}
            {mode === 'marketing' && category==='lp' && <HeaderUpload label={t.uploadLP} onLoad={(rows)=>{ setLpRowsRaw(rows); setLastHeaders((p)=>({...p, lp: Object.keys(rows[0]||{})})); }} />}
            {mode === 'marketing' && category==='web' && <HeaderUpload label={t.uploadWEB} onLoad={(rows)=>{ setWebRowsRaw(rows); setLastHeaders((p)=>({...p, web: Object.keys(rows[0]||{})})); }} />}
            {mode === 'marketing' && category==='crm' && <HeaderUpload label={t.uploadCRM} onLoad={(rows)=>{ setCrmRowsRaw(rows); setLastHeaders((p)=>({...p, crm: Object.keys(rows[0]||{})})); }} />}
            <div className="border-t border-brandBorder my-1"></div>
            <div className="text-xs opacity-70 px-1">Export</div>
            <button onClick={exportPNG} className="px-3 py-2 rounded bg-brandAccent text-black text-left flex items-center gap-2"><FileDown className="w-4 h-4"/>{t.exportPng}</button>
            <button onClick={exportPDF} className="px-3 py-2 rounded bg-brandAccent text-black text-left flex items-center gap-2"><FileDown className="w-4 h-4"/>{t.exportPdf}</button>
            <div className="border-t border-brandBorder my-1"></div>
            <button onClick={()=> setAdminOpen(true)} className="px-3 py-2 rounded bg-brandChip text-left inline-flex items-center gap-2"><Settings className="w-4 h-4"/>{t.admin}</button>
          </div>
        </div>
      </div>
    );
  }

  function TermsCard(){
    const terms = [];
    if (mode === 'business'){
      terms.push([lang==='it'? 'Ricavi' : (bizLabels.revenue||'Revenue'), lang==='it'? 'Entrate totali (preferiamo i ricavi del sito; in alternativa, ricavi CRM chiusi vinti).' : 'Total income (prefer site revenue; else closed‑won CRM revenue).']);
      terms.push(['Spend', lang==='it'? 'Spesa pubblicitaria totale nel periodo.' : 'Total ad spend for the period.']);
      terms.push(['Profit', lang==='it'? 'Ricavi − Spesa.' : 'Revenue − Spend.']);
      terms.push(['ROAS', lang==='it'? 'Ricavi/Spesa.' : 'Revenue/Spend.']);
      terms.push([lang==='it'? 'Margine' : 'Margin', lang==='it'? 'Profitto/Ricavi.' : 'Profit/Revenue.']);
      terms.push([lang==='it'? 'Clienti' : 'Customers', lang==='it'? 'Ordini ecommerce o chiusure CRM.' : 'E‑commerce orders or CRM closed‑won.']);
    } else {
      if (category==='__overview__'){
        terms.push([mktLabels.leads||'Leads', lang==='it'? 'Tutti i lead raccolti nel periodo.' : 'All leads captured in the period.']);
        terms.push([mktLabels.mql||'MQL', lang==='it'? 'Lead qualificati dal marketing.' : 'Marketing Qualified Leads.']);
        terms.push([mktLabels.sql3||'SQL ≥3m', lang==='it'? 'SQL con conversazione ≥3 minuti.' : 'Sales Qualified Leads with talk ≥3 minutes.']);
        terms.push([mktLabels.customers||'Customers', lang==='it'? 'Clienti chiusi (won).' : 'Closed‑won customers.']);
      }
      if (category==='paid'){
        terms.push(['CPL', lang==='it'? 'Costo per Lead = Spesa/Lead.' : 'Cost per Lead = Spend/Leads.']);
        terms.push(['CPA', lang==='it'? 'Costo per Acquisizione = Spesa/Clienti.' : 'Cost per Acquisition = Spend/Customers.']);
        terms.push(['ROAS', lang==='it'? 'Ricavi/Spesa attribuiti agli annunci.' : 'Revenue/Ad Spend.']);
        terms.push(['CTR', lang==='it'? 'Click/Impression.' : 'Clicks/Impressions.']);
        terms.push(['Click→Lead', lang==='it'? 'Lead/Click.' : 'Leads/Clicks.']);
        terms.push(['Lead→Customer', lang==='it'? 'Clienti/Lead.' : 'Customers/Leads.']);
      }
      if (category==='lp'){
        terms.push([lang==='it'? 'Bounce Rate' : 'Bounce Rate', lang==='it'? 'Uscite immediate/Sedute.' : 'Bounces/Sessions.']);
        terms.push([lang==='it'? 'Engagement' : 'Engagement', lang==='it'? 'Indice composito: (1‑Bounce)*PesoTempo + CTA CTR*PesoCTA + Scroll50%*PesoScroll.' : 'Composite index: (1‑Bounce)*TimeW + CTA CTR*CTAW + Scroll50%*ScrollW.']);
        terms.push(['LP CVR', lang==='it'? 'Lead/Sedute della pagina.' : 'Leads/Page Sessions.']);
      }
      if (category==='web'){
        terms.push(['Site CR', lang==='it'? 'Ordini/Sedute.' : 'Orders/Sessions.']);
        terms.push(['AOV', lang==='it'? 'Ricavi/Ordini.' : 'Revenue/Orders.']);
      }
      if (category==='crm'){
        terms.push(['Lead→MQL', lang==='it'? 'MQL/Lead.' : 'MQLs/Leads.']);
        terms.push(['MQL→SQL', lang==='it'? 'SQL/MQL.' : 'SQLs/MQLs.']);
        terms.push(['SQL→Customer', lang==='it'? 'Clienti/SQL.' : 'Customers/SQLs.']);
        terms.push([lang==='it'? 'Ciclo di vendita' : 'Sales Cycle', lang==='it'? 'Media giorni: prima interazione → chiusura.' : 'Avg days: first contact → closed‑won.']);
        terms.push(['CLV', lang==='it'? 'Valore Vita Cliente = AOV × moltiplicatore.' : 'Customer Lifetime Value = AOV × multiplier.']);
      }
    }
    return (
      <Card title={t.terms}>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {terms.map(([k,v])=> (
            <div key={k} className="flex gap-2"><span className="font-medium min-w-[140px]">{k}</span><span className="opacity-80">{v}</span></div>
          ))}
        </div>
      </Card>
    );
  }

  useEffect(()=>{
    const results = [];
    const computed = 100; const totals = 80; let manual; // undefined
    let val = (manual ?? totals) || computed; results.push({name:'fallback totals when manual undefined', pass: val===80, got: val});
    manual = 0; val = (manual ?? totals) || computed; results.push({name:'manual 0 falls back to computed', pass: val===100, got: val});
    manual = 25; val = (manual ?? totals) || computed; results.push({name:'manual numeric overrides totals', pass: val===25, got: val});
    const widgetsOrder = loadLS('widgetsOrder', {paid:["kpis","paidChart"]}); results.push({name:'widgetsOrder paid is array', pass: Array.isArray(widgetsOrder.paid)});
    console.info('[Dashboard self-tests]', results);
  },[]);

  return (
    <div className="min-h-screen bg-brandBg" ref={rootRef}>
      <div className="sticky top-0 z-20 bg-brandNav/90 backdrop-blur border-b border-brandBorder">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-wrap gap-2 items-center text-brandText">
          <div className="flex items-center gap-3">
            <HamMenu />
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/30 flex items-center justify-center">{logo ? <img alt="logo" src={logo} className="w-full h-full object-contain"/> : <span className="text-xs opacity-70">SC</span>}</div>
            <div className="leading-5">
              <div className="text-sm opacity-80">{clientName}</div>
              <h1 className="text-xl font-semibold">{t.title}</h1>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2 items-center">
            <select value={mode} onChange={(e)=>setMode(e.target.value)} className="px-3 py-2 rounded-lg bg-brandInput border border-brandBorder">
              <option value="marketing">{t.marketing}</option>
              <option value="business">{t.business}</option>
            </select>
            <select value={product} onChange={(e)=>setProduct(e.target.value)} className="px-3 py-2 rounded-lg bg-brandInput border border-brandBorder">{PRODUCTS.map((p)=>(<option key={p} value={p}>{p}</option>))}</select>
            {mode === "marketing" && (
              <>
                <select value={category} onChange={(e)=>setCategory(e.target.value)} className="px-3 py-2 rounded-lg bg-brandInput border border-brandBorder">
                  <option value="__overview__">{t.overview}</option>
                  <option value="paid">{t.paid}</option>
                  <option value="lp">{t.lp}</option>
                  <option value="web">{t.web}</option>
                  <option value="crm">{t.crm}</option>
                </select>
                <select disabled={category!=="paid"} value={channel} onChange={(e)=>setChannel(e.target.value)} className={`px-3 py-2 rounded-lg bg-brandInput border border-brandBorder ${category!=="paid"?"opacity-50":""}`}>{channels.map((c)=>(<option key={c.value} value={c.value}>{c.label}</option>))}</select>
              </>
            )}
            <select value={periodType} onChange={(e)=>setPeriodType(e.target.value)} className="px-3 py-2 rounded-lg bg-brandInput border border-brandBorder">
              <option value="month">{t.month}</option>
              <option value="quarter">{t.quarter}</option>
              <option value="year">{t.year}</option>
            </select>
            {periodType === "month" && (
              <input type="month" value={periodMonth} onChange={(e)=>setPeriodMonth(e.target.value)} className="px-3 py-2 rounded-lg bg-brandInput border border-brandBorder" title={t.selectMonth} />
            )}
            {periodType === "quarter" && (
              <select value={periodQuarter} onChange={(e)=>setPeriodQuarter(e.target.value)} className="px-3 py-2 rounded-lg bg-brandInput border border-brandBorder" title={t.selectQuarter}>
                {Array.from({length:6}).flatMap((_,i)=>{ const year=dayjs().year()-2+i; return [1,2,3,4].map(q=>{ const val=`${year}-Q${q}`; return <option key={val} value={val}>{val}</option>; });})}
              </select>
            )}
            {periodType === "year" && (
              <select value={periodYear} onChange={(e)=>setPeriodYear(e.target.value)} className="px-3 py-2 rounded-lg bg-brandInput border border-brandBorder" title={t.selectYear}>
                {Array.from({length:6}).map((_,i)=>{ const y=dayjs().year()-2+i; return <option key={y} value={y}>{y}</option>; })}
              </select>
            )}
            <button onClick={()=>{ setPeriodType("month"); setPeriodMonth(dayjs().format("YYYY-MM")); setPeriodQuarter(`${dayjs().year()}-Q${Math.ceil((dayjs().month()+1)/3)}`); setPeriodYear(`${dayjs().year()}`); setChannel("__ALL__"); }} className="px-3 py-2 rounded-lg bg-brandChip text-brandText text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4"/>{t.reset}</button>
          </div>
        </div>
        <div className="h-1 w-full bg-brandAccent"></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6 flex flex-col gap-4">
        {mode === "business" && (
          <>
            <Card title={`${t.bizObjectives} — ${product} (${periodKey()})`} defaultOpen={true}>
              <textarea value={bizObjMap[`${product}__${periodKey()}`] || ""} onChange={(e)=>{ const next={...bizObjMap,[`${product}__${periodKey()}`]:e.target.value}; setBizObjMap(next); saveLS("bizObjectives", next);} } placeholder="E.g., Revenue target, margin, units, CAC cap, cash constraints…" className="w-full min-h-[120px] bg-brandInput border border-brandBorder rounded-xl p-3 text-brandText"/>
            </Card>
            <Card title={t.bizKpis} defaultOpen={true}>
              <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))'}}>
                <Tile label={bizLabels.revenue||"Revenue"} value={fmtCur(revenueBiz)} icon={<BarChart3 className="w-5 h-5"/>} badge={bizOverrideRaw.length && matchRowByPeriod(mapRows(bizOverrideRaw, config.mappings.biz), product)? t.overridden: null} />
                <Tile label={bizLabels.spend||"Spend"} value={fmtCur(spendBiz)} icon={<FileText className="w-5 h-5"/>} />
                <Tile label={bizLabels.profit||"Profit"} value={fmtCur(profitBiz)} icon={<TrendingUp className="w-5 h-5"/>} />
                <Tile label={bizLabels.roas||"ROAS"} value={`${(roasBiz||0).toFixed(2)}x`} icon={<BarChart3 className="w-5 h-5"/>} />
                <Tile label={bizLabels.margin||"Margin"} value={fmtPct(marginBiz)} icon={<PieIcon className="w-5 h-5"/>} />
                <Tile label={bizLabels.customers||"Customers"} value={fmtInt(customersBiz)} icon={<TrendingUp className="w-5 h-5"/>} />
              </div>
            </Card>
            <Card title="Business Overview">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: bizLabels.revenue||"Revenue", v: revenueBiz }, { name: bizLabels.spend||"Spend", v: spendBiz }, { name: bizLabels.profit||"Profit", v: profitBiz }]}> 
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v)=>fmtCur(v)} />
                    <Bar dataKey="v" fill="#D6ED51" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <div className=""><TermsCard/></div>
          </>
        )}

        {mode === "marketing" && (
          <>
            {category === "__overview__" && (
              <>
                <Card title={`${t.mktObjectives} — ${product} (${periodKey()})`} defaultOpen={true}>
                  <textarea value={mktObjMap[`${product}__${periodKey()}`] || ""} onChange={(e)=>{ const next={...mktObjMap,[`${product}__${periodKey()}`]:e.target.value}; setMktObjMap(next); saveLS("mktObjectives", next);} } placeholder="E.g., Leads target, CPL cap, channel mix, experiments…" className="w-full min-h-[120px] bg-brandInput border border-brandBorder rounded-xl p-3 text-brandText"/>
                </Card>
                <Card title={t.mktKpis} defaultOpen={true}>
                  <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))'}}>
                    <Tile label={mktLabels.leads||"Leads"} value={fmtInt(mktLeads)} icon={<TrendingUp className="w-5 h-5"/>} badge={mktTotalsRaw.length? t.overridden: (config.kpiOverrides?.marketing?.leads!=null? t.overridden:null)} />
                    <Tile label={mktLabels.mql||"MQL"} value={fmtInt(mktMQL)} icon={<TrendingUp className="w-5 h-5"/>} badge={mktTotalsRaw.length? t.overridden: (config.kpiOverrides?.marketing?.mql!=null? t.overridden:null)} />
                    <Tile label={mktLabels.sql3||"SQL ≥3m"} value={fmtInt(mktSQL3)} icon={<TrendingUp className="w-5 h-5"/>} badge={mktTotalsRaw.length? t.overridden: (config.kpiOverrides?.marketing?.sql3!=null? t.overridden:null)} />
                    <Tile label={mktLabels.customers||"Total Customers"} value={fmtInt(mktCustomers)} icon={<TrendingUp className="w-5 h-5"/>} badge={mktTotalsRaw.length? t.overridden: (config.kpiOverrides?.marketing?.customers!=null? t.overridden:null)} />
                  </div>
                </Card>
                <Card title={t.mktFunnel} defaultOpen={true}>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mktFunnelData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="v" name="Count" fill="#D6ED51" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title={t.mktTable} defaultOpen={true}>
                  <div className="overflow-x-auto">
                    {!mktDetailIsOverride ? (
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left opacity-70">
                            <th className="py-2 pr-4">{periodType==='month' ? 'Day' : 'Month'}</th>
                            <th className="py-2 pr-4">{mktLabels.leads||'Leads'}</th>
                            <th className="py-2 pr-4">{mktLabels.mql||'MQL'}</th>
                            <th className="py-2 pr-4">{mktLabels.sql3||'SQL ≥3m'}</th>
                            <th className="py-2 pr-4">{mktLabels.customers||'Customers'}</th>
                            <th className="py-2 pr-4">L→MQL</th>
                            <th className="py-2 pr-4">MQL→SQL</th>
                            <th className="py-2 pr-4">SQL→Cust</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mktTableDataComputed.map((r)=> (
                            <tr key={r.bucket} className="border-t border-brandBorder/60">
                              <td className="py-2 pr-4 font-medium">{r.bucket}</td>
                              <td className="py-2 pr-4">{fmtInt(r.leads)}</td>
                              <td className="py-2 pr-4">{fmtInt(r.mql)}</td>
                              <td className="py-2 pr-4">{fmtInt(r.sql3)}</td>
                              <td className="py-2 pr-4">{fmtInt(r.customers)}</td>
                              <td className="py-2 pr-4">{fmtPct(r.l2m)}</td>
                              <td className="py-2 pr-4">{fmtPct(r.m2s)}</td>
                              <td className="py-2 pr-4">{fmtPct(r.s2c)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left opacity-70">
                            {Object.keys(mktDetailOverride[0]||{}).map((h)=> (<th key={h} className="py-2 pr-4">{h}</th>))}
                          </tr>
                        </thead>
                        <tbody>
                          {mktDetailOverride.map((row, idx)=> (
                            <tr key={idx} className="border-t border-brandBorder/60">
                              {Object.keys(mktDetailOverride[0]||{}).map((h)=> (<td key={h} className="py-2 pr-4">{row[h]}</td>))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </Card>
                <div className=""><TermsCard/></div>
              </>
            )}

            {category !== "__overview__" && (
              <>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={currentOrder} strategy={verticalListSortingStrategy}>
                    <div className="grid gap-4">
                      {currentOrder.map((id) => (
                        <SortableItem key={id} id={id}>
                          {id === "kpis" && (
                            <Card title={`${t.kpis} — ${product}`} right={<span className="text-sm text-brandText/60">{t.category}: {I18N[lang][category] || category}</span>}>
                              {category === "paid" && (
                                <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))'}}>
                                  <Tile label="Spend" value={fmtCur(paid.spend)} icon={<BarChart3 className="w-5 h-5"/>} />
                                  <Tile label="Leads" value={fmtInt(paid.leads)} icon={<TrendingUp className="w-5 h-5"/>} />
                                  <Tile label="Customers" value={fmtInt(paid.customers)} icon={<TrendingUp className="w-5 h-5"/>} />
                                  <Tile label="CPL" value={fmtCur(paid.cpl)} icon={<FileText className="w-5 h-5"/>} />
                                  <Tile label="CPA" value={fmtCur(paid.cpa)} icon={<FileText className="w-5 h-5"/>} />
                                  <Tile label="ROAS" value={`${paid.roas.toFixed(2)}x`} icon={<BarChart3 className="w-5 h-5"/>} />
                                  <Tile label="CTR" value={fmtPct(paid.ctr)} icon={<PieIcon className="w-5 h-5"/>} />
                                  <Tile label="Click→Lead" value={fmtPct(paid.clickToLead)} icon={<PieIcon className="w-5 h-5"/>} />
                                  <Tile label="Lead→Customer" value={fmtPct(paid.leadToCust)} icon={<PieIcon className="w-5 h-5"/>} />
                                </div>
                              )}
                              {category === "lp" && (
                                <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))'}}>
                                  <Tile label="Sessions" value={fmtInt(lps.reduce((s, p) => s + p.sessions, 0))} />
                                  <Tile label="Avg Bounce" value={fmtPct(lps.length ? lps.reduce((s, p) => s + p.bounceRate, 0) / lps.length : 0)} />
                                  <Tile label="Avg Engagement" value={fmtPct(lps.length ? lps.reduce((s, p) => s + p.engagement, 0) / lps.length : 0)} />
                                  <Tile label="Avg LP CVR" value={fmtPct(lps.length ? lps.reduce((s, p) => s + p.lpCvr, 0) / lps.length : 0)} />
                                  <Tile label="Leads" value={fmtInt(lps.reduce((s, p) => s + p.leads, 0))} />
                                  <Tile label="Top Pages" value={fmtInt(lps.length)} secondary="count" />
                                </div>
                              )}
                              {category === "web" && (
                                <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))'}}>
                                  <Tile label="Sessions" value={fmtInt(web.sessions)} />
                                  <Tile label="Orders" value={fmtInt(web.orders)} />
                                  <Tile label="Revenue" value={fmtCur(web.revenue)} />
                                  <Tile label="Site CR" value={fmtPct(web.siteCR)} />
                                  <Tile label="AOV" value={fmtCur(web.aov)} />
                                </div>
                              )}
                              {category === "crm" && (
                                <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))'}}>
                                  <Tile label="Leads" value={fmtInt(crm.totalLeads)} />
                                  <Tile label="MQLs" value={fmtInt(crm.mqls)} />
                                  <Tile label="SQLs" value={fmtInt(crm.sqls)} />
                                  <Tile label="Customers" value={fmtInt(crm.customers)} />
                                  <Tile label="Lead→MQL" value={fmtPct(crm.leadToMql)} />
                                  <Tile label="MQL→SQL" value={fmtPct(crm.mqlToSql)} />
                                  <Tile label="SQL→Cust" value={fmtPct(crm.sqlToCust)} />
                                  <Tile label="Sales Cycle" value={`${Math.round(crm.salesCycleDays)}g`} />
                                  <Tile label="AOV" value={fmtCur(crm.aov)} />
                                  <Tile label="CLV" value={fmtCur(crm.clv)} secondary={`×${clvMult}`} />
                                </div>
                              )}
                            </Card>
                          )}

                          {id === "paidChart" && category === "paid" && (
                            <Card title={t.paidTrends} right={<span className="text-sm text-brandText/60">Weekly</span>}>
                              <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" orientation="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="cpl" name="CPL" stroke="#0ea5e9" dot={false} />
                                    <Line yAxisId="left" type="monotone" dataKey="cpa" name="CPA" stroke="#22c55e" dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#f97316" dot={false} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </Card>
                          )}

                          {id === "lpTable" && category === "lp" && (
                            <Card
                              title={t.lpTable}
                              right={
                                <div className="flex items-center gap-2 text-sm">
                                  <SlidersHorizontal className="w-4 h-4" />
                                  <span>{t.weights}:</span>
                                  <label className="flex items-center gap-1">{t.time}<input type="number" step="0.1" min="0" max="1" value={weights.time} onChange={(e) => setWeights({ ...weights, time: Number(e.target.value) })} className="w-16 ml-1 px-2 py-1 bg-brandInput border border-brandBorder rounded" /></label>
                                  <label className="flex items-center gap-1">{t.cta}<input type="number" step="0.1" min="0" max="1" value={weights.cta} onChange={(e) => setWeights({ ...weights, cta: Number(e.target.value) })} className="w-16 ml-1 px-2 py-1 bg-brandInput border border-brandBorder rounded" /></label>
                                  <label className="flex items-center gap-1">{t.scroll}<input type="number" step="0.1" min="0" max="1" value={weights.scroll} onChange={(e) => setWeights({ ...weights, scroll: Number(e.target.value) })} className="w-16 ml-1 px-2 py-1 bg-brandInput border border-brandBorder rounded" /></label>
                                </div>
                              }
                            >
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                  <thead>
                                    <tr className="text-left opacity-70">
                                      <th className="py-2 pr-4">Page</th>
                                      <th className="py-2 pr-4">Sessions</th>
                                      <th className="py-2 pr-4">Bounce</th>
                                      <th className="py-2 pr-4">Engagement</th>
                                      <th className="py-2 pr-4">LP CVR</th>
                                      <th className="py-2 pr-4">Avg Time (s)</th>
                                      <th className="py-2 pr-4">CTA CTR</th>
                                      <th className="py-2 pr-4">Scroll ≥50%</th>
                                      <th className="py-2 pr-4">Leads</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {lps.map((p) => (
                                      <tr key={p.page} className="border-t border-brandBorder/60">
                                        <td className="py-2 pr-4 font-medium">{p.page}</td>
                                        <td className="py-2 pr-4">{fmtInt(p.sessions)}</td>
                                        <td className="py-2 pr-4">{fmtPct(p.bounceRate)}</td>
                                        <td className="py-2 pr-4">{fmtPct(p.engagement)}</td>
                                        <td className="py-2 pr-4">{fmtPct(p.lpCvr)}</td>
                                        <td className="py-2 pr-4">{Math.round(p.timeAvg)}</td>
                                        <td className="py-2 pr-4">{fmtPct(p.ctaCtr)}</td>
                                        <td className="py-2 pr-4">{fmtPct(p.scrollRate)}</td>
                                        <td className="py-2 pr-4">{fmtInt(p.leads)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </Card>
                          )}

                          {id === "webCard" && category === "web" && (
                            <Card title="Website & E‑commerce">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-72">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[{ name: "Sessions", v: web.sessions }, { name: "Orders", v: web.orders }, { name: "Revenue", v: web.revenue }]}> 
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" />
                                      <YAxis />
                                      <Tooltip />
                                      <Bar dataKey="v" name="Value" fill="#2ecc71" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <Tile label="Site CR" value={fmtPct(web.siteCR)} />
                                  <Tile label="AOV" value={fmtCur(web.aov)} />
                                </div>
                              </div>
                            </Card>
                          )}

                          {id === "crmFunnel" && category === "crm" && (
                            <Card title={t.funnel} right={<div className="flex items-center gap-2 text-sm"><span>{t.clvMult}</span><input type="number" min={0} step={0.1} value={clvMult} onChange={(e) => setClvMult(Number(e.target.value))} className="w-20 px-2 py-1 bg-brandInput border border-brandBorder rounded" /></div>}>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-72">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[{ name: "Lead→MQL", v: crm.leadToMql }, { name: "MQL→SQL", v: crm.mqlToSql }, { name: "SQL→Customer", v: crm.sqlToCust }]}> 
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" />
                                      <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                                      <Tooltip formatter={(v) => fmtPct(v)} />
                                      <Bar dataKey="v" name="Rate" fill="#f1c40f" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <Tile label="Sales Cycle" value={`${Math.round(crm.salesCycleDays)} giorni`} />
                                  <Tile label="AOV" value={fmtCur(crm.aov)} />
                                  <Tile label="CLV" value={fmtCur(crm.clv)} secondary={`×${clvMult}`} />
                                  <div className="rounded-2xl shadow-card bg-brandCard p-4">
                                    <div className="text-sm opacity-70 mb-2">Channel share (Leads)</div>
                                    <div className="h-44">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                          <Pie data={Array.from(new Map(paidRows.filter((r)=>r.product===product).reduce((acc, r) => { const cur = acc.get(r.channel) || { name: r.channel, value: 0 }; cur.value += toNum(r.leads); acc.set(r.channel, cur); return acc; }, new Map())).values())} dataKey="value" nameKey="name" outerRadius={70}>
                                            {Array.from({length:10}).map((_,i)=> (<Cell key={i} fill={["#2ecc71","#f1c40f","#e74c3c","#14b8a6","#a78bfa","#0ea5e9","#ef4444","#22c55e","#f59e0b","#8b5cf6"][i%10]} />))}
                                          </Pie>
                                          <Tooltip />
                                          <Legend />
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )}

                          {id === "sources" && category === "paid" && (
                            <Card title={t.sources}>
                              <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={
                                    Array.from(
                                      new Map(
                                        paidFiltered.reduce((acc, r) => {
                                          const cur = acc.get(r.channel) || { channel: r.channel, leads: 0, clicks: 0 };
                                          cur.leads += toNum(r.leads);
                                          cur.clicks += toNum(r.clicks);
                                          acc.set(r.channel, cur);
                                          return acc;
                                        }, new Map())
                                      ).values()
                                    ).map((r) => ({ ...r, cvr: r.clicks ? r.leads / r.clicks : 0 }))
                                  }>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="channel" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                                    <Legend />
                                    <Tooltip formatter={(v, n) => (n === "cvr" ? fmtPct(v) : v)} />
                                    <Bar yAxisId="left" dataKey="leads" name="Leads" fill="#2ecc71" />
                                    <Bar yAxisId="right" dataKey="cvr" name="CVR (Click→Lead)" fill="#e74c3c" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </Card>
                          )}

                          {id === "notes" && (
                            <Card title={t.notes}>
                              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Scrivi qui le note per WBR/MBR, azioni, rischi, decisioni…" className="w-full min-h-[120px] bg-brandInput border border-brandBorder rounded-xl p-3 text-brandText" />
                            </Card>
                          )}

                          {id === "change" && (
                            <Card title={t.changeReq}>
                              <CRForm />
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                  <thead>
                                    <tr className="text-left opacity-70">
                                      <th className="py-2 pr-4">{t.titleCR}</th>
                                      <th className="py-2 pr-4">{t.descCR}</th>
                                      <th className="py-2 pr-4">{t.impact}</th>
                                      <th className="py-2 pr-4">{t.confidence}</th>
                                      <th className="py-2 pr-4">{t.effort}</th>
                                      <th className="py-2 pr-4">{t.ice}</th>
                                      <th className="py-2 pr-4">{t.status}</th>
                                      <th className="py-2 pr-4">{t.actions}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {cr.map((r, i) => (
                                      <tr key={i} className="border-t border-brandBorder/60">
                                        <td className="py-2 pr-4 font-medium">{r.title}</td>
                                        <td className="py-2 pr-4">{r.desc}</td>
                                        <td className="py-2 pr-4">{r.impact}</td>
                                        <td className="py-2 pr-4">{r.confidence}</td>
                                        <td className="py-2 pr-4">{r.effort}</td>
                                        <td className="py-2 pr-4">{r.ice}</td>
                                        <td className="py-2 pr-4">
                                          <select value={r.status} onChange={(e) => { const next = [...cr]; next[i].status = e.target.value; setCR(next); saveLS("changeRequests", next); }} className="px-2 py-1 rounded bg-brandInput border border-brandBorder">
                                            <option value="open">{t.open}</option>
                                            <option value="planned">{t.planned}</option>
                                            <option value="done">{t.done}</option>
                                          </select>
                                        </td>
                                        <td className="py-2 pr-4">
                                          <button onClick={() => delCR(i)} className="px-2 py-1 rounded bg-red-600/80 text-white flex items-center gap-1"><Trash2 className="w-4 h-4"/>Del</button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </Card>
                          )}
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <div className=""><TermsCard/></div>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        :root{
          --brand-bg:#1B2622; /* DARK BG */
          --brand-nav:#16201c;
          --brand-card:#1f2a26;
          --brand-hover:#23332e;
          --brand-text:#F3F7E1;
          --brand-border:#2a3b35;
          --brand-chip:#20312b;
          --brand-input:#1c2723;
          --brand-accent:#D6ED51; /* main color */
        }
        [data-theme="light"]{
          --brand-bg:#f7f9f5;
          --brand-nav:#ffffff;
          --brand-card:#ffffff;
          --brand-hover:#f1f5ec;
          --brand-text:#1B2622;
          --brand-border:#e2eadf;
          --brand-chip:#eef3ea;
          --brand-input:#f5f8f3;
          --brand-accent:#D6ED51;
        }
        .bg-brandBg{ background: var(--brand-bg); }
        .bg-brandNav{ background: var(--brand-nav); }
        .bg-brandCard{ background: var(--brand-card); }
        .bg-brandHover{ background: var(--brand-hover); }
        .text-brandText{ color: var(--brand-text); }
        .border-brandBorder{ border-color: var(--brand-border); }
        .bg-brandChip{ background: var(--brand-chip); }
        .bg-brandInput{ background: var(--brand-input); color: var(--brand-text); }
        .bg-brandAccent{ background: var(--brand-accent); }
        .shadow-card{ box-shadow: 0 10px 28px rgba(0,0,0,0.35); }
        summary::-webkit-details-marker{display:none}
        select, input, textarea{ outline:none }
      `}</style>

      <AdminPanel open={adminOpen} onClose={()=>setAdminOpen(false)} t={t} config={config} setConfig={setConfig} lastHeaders={lastHeaders}/>
    </div>
  );
}

function CRForm() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [impact, setImpact] = useState(6);
  const [confidence, setConfidence] = useState(7);
  const [effort, setEffort] = useState(3);
  const ice = (impact * confidence) / Math.max(1, effort);
  return (
    <div className="grid md:grid-cols-5 gap-2 items-end">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="md:col-span-1 px-3 py-2 rounded bg-brandInput border border-brandBorder"/>
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="md:col-span-2 px-3 py-2 rounded bg-brandInput border border-brandBorder"/>
      <input type="number" min={1} max={10} value={impact} onChange={(e) => setImpact(Number(e.target.value))} className="px-3 py-2 rounded bg-brandInput border border-brandBorder" placeholder="Impact" />
      <input type="number" min={1} max={10} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="px-3 py-2 rounded bg-brandInput border border-brandBorder" placeholder="Confidence" />
      <div className="flex gap-2 items-center">
        <input type="number" min={1} max={10} value={effort} onChange={(e) => setEffort(Number(e.target.value))} className="px-3 py-2 rounded bg-brandInput border border-brandBorder w-24" placeholder="Effort" />
        <button onClick={() => { if (!title) return; const stored = JSON.parse(localStorage.getItem('changeRequests')||'[]'); const next = [{ title, desc, impact, confidence, effort, ice: Number(ice.toFixed(1)), status: 'open', created: dayjs().format('YYYY-MM-DD') }, ...stored]; localStorage.setItem('changeRequests', JSON.stringify(next)); window.dispatchEvent(new Event('storage')); setTitle(''); setDesc(''); }} className="px-3 py-2 rounded-lg bg-brandAccent text-black flex items-center gap-1"><Plus className="w-4 h-4"/>Add</button>
      </div>
    </div>
  );
}
