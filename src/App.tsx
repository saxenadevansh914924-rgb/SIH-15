import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  CircleMarker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BellRing,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CloudSun,
  Compass,
  Download,
  Droplets,
  Database,
  Eye,
  FileText,
  Filter,
  Layers,
  Leaf,
  Globe2,
  LocateFixed,
  Map as MapIcon,
  Maximize2,
  Menu,
  Moon,
  MoreHorizontal,
  PanelRightClose,
  Plus,
  Palette,
  Search,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  Trees,
  TrendingUp,
  Upload,
  UserRound,
  Waves,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { getWatershedAnalysis, images, interventions, watersheds } from "./data";
import type { Watershed } from "./data";
const nav = [
  ["Overview", "/", Activity],
  ["Watersheds", "/watersheds", Waves],
  ["Geo-Coded Images", "/geo-images", Camera],
  ["Spatial Analysis", "/spatial-analysis", BarChart3],
  ["GIS Explorer", "/gis", MapIcon],
  ["Change Detection", "/change-detection", Compass],
  ["Analytics", "/analytics", TrendingUp],
  ["Reports", "/reports", FileText],
  ["Settings", "/settings", SettingsIcon],
] as const;
const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
const titles: Record<string, string> = {
  "/": "Watershed Intelligence",
  "/watersheds": "Watersheds",
  "/geo-images": "Geo-Coded Images",
  "/spatial-analysis": "Spatial Analysis",
  "/gis": "GIS Explorer",
  "/change-detection": "Change Detection",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/settings": "Settings",
};
function App() {
  const [dark, setDark] = useState(localStorage.getItem("wi-theme") === "dark"),
    [collapsed, setCollapsed] = useState(false),
    [mobile, setMobile] = useState(false),
    [notificationsOpen, setNotificationsOpen] = useState(false),
    [profile, setProfile] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("wi-profile") || "null") || {
          name: "Arjun Sharma",
          role: "Watershed Administrator",
        };
      } catch {
        return { name: "Arjun Sharma", role: "Watershed Administrator" };
      }
    });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("wi-theme", dark ? "dark" : "light");
  }, [dark]);
  const loc = useLocation();
  const navigate = useNavigate();
  const openProfile = () => {
    setMobile(false);
    navigate("/settings?tab=Account");
  };
  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${mobile ? "mobile-open" : ""}`}
      >
        <div className="brand">
          <div className="brand-mark">
            <Waves size={20} />
          </div>
          {!collapsed && (
            <div>
              <b>WATERSHED</b>
              <strong>
                INSIGHT<span>●</span>
              </strong>
            </div>
          )}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft size={16} />
          </button>
        </div>
        <div className="workspace-tag">{!collapsed && "WORKSPACE"}</div>
        <nav>
          {nav.map(([label, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              title={label}
              onClick={() => setMobile(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={17} />
              {!collapsed && <span>{label}</span>}
              {path === "/gis" && !collapsed && <span className="live-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <CircleHelp size={17} />
            {!collapsed && (
              <span>
                Help & documentation<small>Explore the platform</small>
              </span>
            )}
            <ChevronRight size={14} />
          </div>
          <NavLink
            to="/settings?tab=Account"
            className="user-row"
            onClick={() => setMobile(false)}
            aria-label={`Open profile for ${profile.name}`}
            title="Open profile"
          >
            <div className="avatar">{initials(profile.name)}</div>
            {!collapsed && (
              <div className="user-copy">
                <b>{profile.name}</b>
                <small>{profile.role}</small>
              </div>
            )}
            <MoreHorizontal size={17} />
          </NavLink>
        </div>
      </aside>
      {mobile && (
        <button className="mobile-scrim" onClick={() => setMobile(false)} />
      )}
      <main className="main-shell">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMobile(!mobile)}
          >
            <Menu size={19} />
          </button>
          <div className="crumb">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <b>{titles[loc.pathname] || "Watershed detail"}</b>
          </div>
          <div className="top-actions">
            <button
              className="search-trigger"
              onClick={() => (location.href = "/gis")}
            >
              <Search size={15} />
              <span>Search anywhere...</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="notification-wrap">
              <button
                className="icon-btn"
                title="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={18} />
                {localStorage.getItem("wi-in-app-alerts") !== "false" && <i />}
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="notification-popover-head">
                    <span><b>Monitoring alerts</b><small>Prototype activity feed</small></span>
                    <button className="icon-btn small" onClick={() => setNotificationsOpen(false)}><X size={15}/></button>
                  </div>
                  {localStorage.getItem("wi-in-app-alerts") === "false" ? (
                    <p className="notification-muted">In-app alerts are turned off. Enable them in Settings → Notifications.</p>
                  ) : (
                    <div className="notification-items">
                      <div><span className="notification-dot green"/><span><b>Vegetation change detected</b><small>Rampur Watershed · 2 hours ago</small></span></div>
                      <div><span className="notification-dot blue"/><span><b>Water area increased</b><small>Velhe Watershed · 5 hours ago</small></span></div>
                      <div><span className="notification-dot amber"/><span><b>New geo-coded images uploaded</b><small>12 field photos · Yesterday</small></span></div>
                    </div>
                  )}
                  <div className="notification-foot">Demo alerts · no external messages are sent</div>
                </div>
              )}
            </div>
            <button
              className="icon-btn"
              onClick={() => setDark(!dark)}
              title="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              className="top-avatar"
              onClick={openProfile}
              aria-label="Open profile settings"
              title="Open profile"
            >
              {initials(profile.name)}
            </button>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/gis" element={<GIS />} />
          <Route path="/watersheds" element={<WatershedsPage />} />
          <Route path="/watersheds/:id" element={<Details />} />
          <Route path="/geo-images" element={<ImagesPage />} />
          <Route path="/spatial-analysis" element={<Analysis />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/change-detection" element={<Change />} />
          <Route path="/reports" element={<Reports />} />
          <Route
            path="/settings"
            element={
              <SettingsPage
                dark={dark}
                setDark={setDark}
                profile={profile}
                setProfile={setProfile}
              />
            }
          />
          <Route path="*" element={<Overview />} />
        </Routes>
      </main>
    </div>
  );
}
function PageHead({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children?: any;
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children && <div className="head-actions">{children}</div>}
    </div>
  );
}
const kpis = [
  [
    "Total watersheds",
    "128",
    "Across 12 states",
    "+8 this quarter",
    Waves,
    "mint",
  ],
  [
    "Geo-coded images",
    "4,862",
    "Field evidence collected",
    "+14.2%",
    Camera,
    "blue",
  ],
  ["Interventions", "1,247", "Mapped on the ground", "+6.8%", MapIcon, "amber"],
  ["Water bodies", "386", "Across monitored areas", "+3.1%", Droplets, "cyan"],
];
const chartData = [
  { m: "Jan", vegetation: 36, water: 51, monitoring: 58 },
  { m: "Feb", vegetation: 37, water: 48, monitoring: 62 },
  { m: "Mar", vegetation: 38, water: 54, monitoring: 61 },
  { m: "Apr", vegetation: 38, water: 57, monitoring: 69 },
  { m: "May", vegetation: 40, water: 55, monitoring: 72 },
  { m: "Jun", vegetation: 41, water: 64, monitoring: 78 },
  { m: "Jul", vegetation: 42.8, water: 72, monitoring: 84 },
];
function Overview() {
  const exportSummary = () => {
    const rows: (string | number)[][] = [
      ["Watershed Intelligence — Overview Summary"],
      ["Generated at", new Date().toLocaleString("en-IN")],
      [],
      ["Key indicators"],
      ["Metric", "Value", "Description", "Change"],
      ...kpis.map(([title, value, description, change]) => [title, value, description, change] as (string | number)[]),
      ["Vegetation coverage", "42.8%", "Monitored basins", "+4.6%"],
      ["Areas under monitoring", "18,420 ha", "Across 128 watersheds", ""],
      [],
      ["Watershed monitoring trend"],
      ["Month", "Vegetation coverage (%)", "Water index", "Monitoring (%)"],
      ...chartData.map(({ m, vegetation, water, monitoring }) => [m, vegetation, water, monitoring]),
      [],
      ["Intervention distribution"],
      ["Type", "Share"],
      ["Water harvesting", "34%"],
      ["Plantation", "27%"],
      ["Soil conservation", "23%"],
      ["Other interventions", "16%"],
      [],
      ["Recent watershed activity"],
      ["Watershed", "Activity", "Details", "Updated"],
      ["Rampur Watershed", "Geo-coded images uploaded", "12 new field photos · Lucknow, UP", "2h ago"],
      ["Velhe Watershed", "Vegetation change detected", "+8.2% NDVI proxy · Pune, MH", "5h ago"],
      ["Khordha Watershed", "Check dam verified", "Intervention marked complete · Odisha", "Yesterday"],
      [],
      ["Note", "Prototype demonstration data; not sourced from live satellite imagery."],
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    downloadBlob(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }), `watershed-overview-${new Date().toISOString().slice(0, 10)}.csv`);
  };
  return (
    <div className="page">
      <PageHead
        eyebrow="MONITORING OVERVIEW"
        title="Watershed Overview"
        subtitle="A clear view of watershed health, field activity and spatial change."
      >
        <button className="button secondary">
          <span className="status-dot" /> Live monitoring{" "}
          <ChevronDown size={14} />
        </button>
        <button className="button primary" onClick={exportSummary}>
          <Download size={15} /> Export summary
        </button>
      </PageHead>
      <div className="kpi-grid">
        {kpis.map(([t, n, sub, trend, I, c]: any) => (
          <div className="kpi-card" key={t}>
            <div className="kpi-top">
              <div className={`kpi-icon ${c}`}>
                <I size={18} />
              </div>
              <span className="trend">
                <ArrowUpRight size={13} />
                {trend}
              </span>
            </div>
            <div className="kpi-number">{n}</div>
            <div className="kpi-label">{t}</div>
            <div className="kpi-sub">{sub}</div>
          </div>
        ))}
      </div>
      <div className="secondary-kpi-row">
        <div>
          <span className="secondary-kpi-icon">
            <Leaf size={15} />
          </span>
          <span>
            <small>VEGETATION COVERAGE</small>
            <b>42.8%</b>
          </span>
          <em>
            <ArrowUpRight size={12} /> +4.6%
          </em>
        </div>
        <div>
          <span className="secondary-kpi-icon area-icon">
            <MapIcon size={15} />
          </span>
          <span>
            <small>AREAS UNDER MONITORING</small>
            <b>
              18,420 <i>ha</i>
            </b>
          </span>
          <em>Across 128 watersheds</em>
        </div>
      </div>
      <div className="insight-strip">
        <div className="insight-icon">
          <Leaf size={18} />
        </div>
        <div>
          <b>Vegetation coverage is trending up</b>
          <p>
            Monitored watersheds show a <strong>+12.4%</strong> gain in
            vegetation cover since the start of the season.
          </p>
        </div>
        <a href="/spatial-analysis">
          Explore analysis <ArrowRight size={14} />
        </a>
        <span className="strip-value">
          42.8%<small>+4.6% this month</small>
        </span>
      </div>
      <div className="dashboard-grid">
        <div className="panel trend-panel">
          <div className="panel-heading">
            <div>
              <h3>Watershed monitoring trend</h3>
              <p>Vegetation coverage across monitored basins</p>
            </div>
            <button className="select-button">
              Last 7 months <ChevronDown size={14} />
            </button>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-green" /> Vegetation cover
            </span>
            <span>
              <i className="legend-gray" /> Target range
            </span>
          </div>
          <div className="chart large-chart">
            <ResponsiveContainer>
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 10, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#539c72" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#539c72" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="var(--grid)"
                />
                <XAxis
                  dataKey="m"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <ChartTip />
                <Area
                  type="monotone"
                  dataKey="vegetation"
                  stroke="#4e996e"
                  strokeWidth={2.4}
                  fill="url(#greenFill)"
                />
                <Line
                  type="monotone"
                  dataKey="vegetation"
                  stroke="#4e996e"
                  strokeWidth={2.4}
                  dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footer">
            <span>
              <i className="status-dot" />
              Current coverage
            </span>
            <b>
              42.8% <small>of 50% target</small>
            </b>
          </div>
        </div>
        <div className="panel distribution-panel">
          <div className="panel-heading">
            <div>
              <h3>Intervention distribution</h3>
              <p>Mapped interventions by type</p>
            </div>
            <button className="icon-btn small">
              <MoreHorizontal size={17} />
            </button>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { n: "Water harvesting", v: 34 },
                    { n: "Plantation", v: 27 },
                    { n: "Soil conservation", v: 23 },
                    { n: "Other", v: 16 },
                  ]}
                  dataKey="v"
                  nameKey="n"
                  innerRadius={68}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {["#548f6d", "#85b99a", "#d8ad64", "#b6c6bc"].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
                <ChartTip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <b>1,247</b>
              <small>Total sites</small>
            </div>
          </div>
          <div className="type-legend">
            {[
              ["Water harvesting", "34%", "#548f6d"],
              ["Plantation", "27%", "#85b99a"],
              ["Soil conservation", "23%", "#d8ad64"],
              ["Other interventions", "16%", "#b6c6bc"],
            ].map(([n, p, c]) => (
              <div key={n}>
                <span>
                  <i style={{ background: c }} />
                  {n}
                </span>
                <b>{p}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lower-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Recent watershed activity</h3>
              <p>Field updates from your monitored regions</p>
            </div>
            <a className="text-link" href="/watersheds">
              View all <ArrowRight size={14} />
            </a>
          </div>
          <div className="activity-list">
            {[
              [
                "Rampur Watershed",
                "Geo-coded images uploaded",
                "12 new field photos · Lucknow, UP",
                "2h ago",
                "camera",
              ],
              [
                "Velhe Watershed",
                "Vegetation change detected",
                "+8.2% NDVI proxy · Pune, MH",
                "5h ago",
                "leaf",
              ],
              [
                "Khordha Watershed",
                "Check dam verified",
                "Intervention marked complete · Odisha",
                "Yesterday",
                "check",
              ],
            ].map(([n, t, d, time, type]) => (
              <div className="activity-row" key={n}>
                <div className={`activity-icon ${type}`}>
                  {type === "camera" ? (
                    <Camera size={16} />
                  ) : type === "leaf" ? (
                    <Leaf size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                </div>
                <div className="activity-copy">
                  <b>{n}</b>
                  <span>{t}</span>
                  <small>{d}</small>
                </div>
                <time>{time}</time>
              </div>
            ))}
          </div>
        </div>
        <div className="panel map-preview-panel">
          <div className="panel-heading">
            <div>
              <h3>Monitoring coverage</h3>
              <p>Active watershed regions</p>
            </div>
            <a className="icon-btn small" href="/gis">
              <ArrowRight size={15} />
            </a>
          </div>
          <div className="preview-map">
            <MiniMap />
            <div className="preview-label">
              <span className="status-dot" />
              12 regions monitored
            </div>
          </div>
          <a href="/gis" className="map-open-link">
            Open GIS Explorer <ArrowRight size={14} />
          </a>
        </div>
      </div>
      <footer className="footer-note">
        <span>Data shown is prototype demonstration data</span>
        <span>
          Imagery concept: 30 m SRISHTI-DRISHTI · Last updated 29 Sep 2026
        </span>
      </footer>
    </div>
  );
}
function MiniMap() {
  return (
    <MapContainer
      center={[24.8, 79]}
      zoom={4}
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {watersheds.slice(0, 7).map((w) => (
        <CirclePin key={w.id} w={w} />
      ))}
    </MapContainer>
  );
}
function CirclePin({ w }: { w: Watershed }) {
  return (
    <CircleMarker
      center={[w.lat, w.lng]}
      radius={4}
      pathOptions={{
        color: "#fff",
        weight: 1,
        fillColor: "#4c8a61",
        fillOpacity: 0.95,
      }}
    />
  );
}
function GIS() {
  const [selected, setSelected] = useState<Watershed | null>(null),
    [point, setPoint] = useState<[number, number] | null>(null),
    [query, setQuery] = useState(""),
    [showLayers, setShowLayers] = useState(true),
    [mapLabels, setMapLabels] = useState(
      localStorage.getItem("wi-map-labels") !== "false",
    ),
    [layers, setLayers] = useState<Record<string, boolean>>({
      "Watershed boundaries": true,
      "Geo-coded images": true,
      "Water bodies": true,
      "Drainage network": false,
      "Check dams": true,
      "Farm ponds": true,
      Vegetation: false,
      "Land use": false,
      "Change detection": false,
    });
  const navigate = useNavigate();
  const home = watersheds.find(
    (w) => w.id === localStorage.getItem("wi-home-watershed"),
  );
  const defaultCenter: [number, number] = home
    ? [home.lat, home.lng]
    : [26.84, 80.97];
  const defaultZoom = home ? 12 : 10;
  const nearest = point
    ? watersheds.reduce((a, b) => (dist(point, a) < dist(point, b) ? a : b))
    : null;
  const filtered = watersheds.filter((w) =>
    (w.name + " " + w.district + " " + w.id)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="gis-page">
      <div className="gis-top">
        <div>
          <div className="eyebrow">SPATIAL MONITORING · INDIA</div>
          <h1>GIS Watershed Explorer</h1>
          <p>Explore boundaries, field evidence and watershed interventions.</p>
        </div>
        <div className="gis-top-actions">
          <span className="data-badge">
            <i /> DEMO DATA
          </span>
          <button className="button secondary">
            <CloudSun size={15} /> Satellite context <ChevronDown size={13} />
          </button>
        </div>
      </div>
      <div className="map-workspace">
        <div className="map-area">
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            scrollWheelZoom
            zoomControl={false}
            className="main-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController
              selected={selected}
              point={point}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
            />
            <MapClick
              onClick={(p) => {
                setPoint(p);
                setSelected(null);
              }}
            />
            {layers["Watershed boundaries"] &&
              watersheds.map((w) => (
                <Polygon
                  key={w.id}
                  positions={w.coordinates}
                  bubblingMouseEvents={false}
                  pathOptions={{
                    color: selected?.id === w.id ? "#cb7747" : "#397e5a",
                    weight: selected?.id === w.id ? 3 : 1.5,
                    fillColor: selected?.id === w.id ? "#73a985" : "#76ab89",
                    fillOpacity: selected?.id === w.id ? 0.34 : 0.17,
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelected(w);
                      setPoint(null);
                    },
                  }}
                >
                  {mapLabels && (
                    <Tooltip sticky>
                      <b>{w.name} Watershed</b>
                      <br />
                      Area: {fmt(w.area)} ha · Vegetation: {w.veg}%<br />
                      Interventions: {w.interventions}
                    </Tooltip>
                  )}
                  <Popup>
                    <b>{w.name} Watershed</b>
                    <br />
                    {w.district}, {w.state}
                    <br />
                    {fmt(w.area)} ha
                  </Popup>
                </Polygon>
              ))}
            {layers["Drainage network"] &&
              watersheds.slice(0, 5).map((w, i) => (
                <Polyline
                  key={w.id}
                  positions={[
                    [w.lat + 0.06, w.lng - 0.04],
                    [w.lat + 0.02, w.lng - 0.015],
                    [w.lat, w.lng],
                    [w.lat - 0.03, w.lng + 0.04],
                  ]}
                  pathOptions={{
                    color: "#3689aa",
                    weight: i % 2 ? 2 : 3,
                    opacity: 0.75,
                  }}
                />
              ))}
            {layers["Water bodies"] &&
              watersheds.flatMap((w, i) =>
                [0, 1].map((j) => (
                  <CircleShape key={`${w.id}-water-${j}`} w={w} i={i * 2 + j} />
                )),
              )}
            {layers["Vegetation"] &&
              watersheds.slice(0, 10).map((w) => (
                <Circle
                  key={`${w.id}-veg`}
                  center={[w.lat, w.lng]}
                  radius={650}
                  pathOptions={{
                    color: "#4c9465",
                    weight: 1,
                    fillColor: "#65a975",
                    fillOpacity: 0.22,
                  }}
                >
                  <Popup>
                    Vegetation coverage · {w.veg}%<br />
                    {w.name} Watershed · prototype analysis
                  </Popup>
                </Circle>
              ))}
            {layers["Land use"] &&
              watersheds.slice(0, 10).map((w, i) => (
                <Circle
                  key={`${w.id}-landuse`}
                  center={[w.lat - 0.012, w.lng + 0.018]}
                  radius={420}
                  pathOptions={{
                    color: "#bd9b5f",
                    weight: 1,
                    fillColor: i % 3 === 0 ? "#6f9b67" : "#c2a46a",
                    fillOpacity: 0.42,
                  }}
                >
                  <Popup>
                    Land use classification ·{" "}
                    {i % 3 === 0 ? "Vegetation" : "Agriculture"}
                    <br />
                    {w.name} Watershed · demo map
                  </Popup>
                </Circle>
              ))}
            {layers["Change detection"] &&
              watersheds.slice(0, 6).map((w, i) => (
                <Circle
                  key={`${w.id}-change`}
                  center={[w.lat + 0.018, w.lng + 0.012]}
                  radius={360}
                  pathOptions={{
                    color: i % 2 ? "#bf7058" : "#bf9a55",
                    weight: 1.5,
                    fillColor: i % 2 ? "#d5846b" : "#ddbb71",
                    fillOpacity: 0.48,
                  }}
                >
                  <Popup>
                    Spatial change alert
                    <br />
                    {w.name} Watershed · demo detection
                  </Popup>
                </Circle>
              ))}
            {layers["Geo-coded images"] &&
              images.slice(0, 16).map((im, i) => (
                <Marker
                  key={im.id}
                  position={[im.lat, im.lng]}
                  icon={cameraIcon}
                >
                  <Popup>
                    <div className="popup-image">
                      <img src={im.imageUrl} />
                      <b>
                        {im.title} · {im.id}
                      </b>
                      <span>
                        {im.lat.toFixed(5)}° N, {im.lng.toFixed(5)}° E
                      </span>
                      <button onClick={() => navigate("/geo-images")}>
                        View image details →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            {layers["Check dams"] &&
              interventions
                .filter((x) => x.type === "Check Dam")
                .slice(0, 16)
                .map((x) => (
                  <Marker
                    key={x.id}
                    position={[x.lat, x.lng]}
                    icon={interventionIcon}
                  >
                    <Popup>
                      <b>{x.type}</b>
                      <br />
                      {x.id} · {x.status}
                    </Popup>
                  </Marker>
                ))}
            {layers["Farm ponds"] &&
              interventions
                .filter((x) => x.type === "Farm Pond")
                .slice(0, 16)
                .map((x) => (
                  <Marker key={x.id} position={[x.lat, x.lng]} icon={pondIcon}>
                    <Popup>
                      <b>{x.type}</b>
                      <br />
                      {x.id} · {x.status}
                    </Popup>
                  </Marker>
                ))}
            {point && (
              <Marker position={point} icon={selectedIcon}>
                <Popup>
                  Selected location
                  <br />
                  {point[0].toFixed(6)}°, {point[1].toFixed(6)}°
                </Popup>
              </Marker>
            )}
          </MapContainer>
          <div className="map-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search watershed, district, village or coordinates…"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={15} />
              </button>
            )}
            <kbd>⌘ K</kbd>
            {query && (
              <div className="search-results">
                {filtered.slice(0, 6).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelected(w);
                      setPoint(null);
                      setQuery("");
                    }}
                  >
                    <MapIcon size={15} />
                    <span>
                      <b>{w.name} Watershed</b>
                      <small>
                        {w.district}, {w.state} · {w.id}
                      </small>
                    </span>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="map-toolbar">
            <button
              title="Zoom in"
              onClick={() => window.dispatchEvent(new Event("map-zoom-in"))}
            >
              <Plus size={17} />
            </button>
            <button
              title="Zoom out"
              onClick={() => window.dispatchEvent(new Event("map-zoom-out"))}
            >
              <span className="minus">−</span>
            </button>
            <i />
            <button
              title="Reset view"
              onClick={() => {
                setSelected(null);
                setPoint(null);
                window.dispatchEvent(new Event("map-reset"));
              }}
            >
              <LocateFixed size={16} />
            </button>
            <button
              title="Fullscreen"
              onClick={() => {
                document
                  .querySelector(".map-area")
                  ?.classList.toggle("map-fullscreen");
                setTimeout(
                  () => window.dispatchEvent(new Event("map-resize")),
                  80,
                );
              }}
            >
              <Maximize2 size={16} />
            </button>
          </div>
          <div className="layer-control">
            <button
              className="layer-head"
              onClick={() => setShowLayers(!showLayers)}
            >
              <span className="layer-stack">
                <Layers size={15} />
              </span>
              <b>Map layers</b>
              <span className="layer-count">
                {Object.values(layers).filter(Boolean).length}
              </span>
              <ChevronDown size={14} className={showLayers ? "" : "rotate"} />
            </button>
            {showLayers && (
              <div className="layer-list">
                {Object.entries(layers).map(([l, on], i) => (
                  <label key={l}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => setLayers({ ...layers, [l]: !on })}
                    />
                    <span className={`layer-swatch swatch-${i}`}>
                      {i === 1 ? (
                        <Camera size={11} />
                      ) : i === 3 ? (
                        <Activity size={11} />
                      ) : i === 7 ? (
                        <Activity size={11} />
                      ) : null}
                    </span>
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            )}
            <button
              className="manage-layers"
              onClick={() =>
                setLayers(
                  Object.fromEntries(Object.keys(layers).map((l) => [l, true])),
                )
              }
            >
              Manage layer visibility <ArrowRight size={13} />
            </button>
          </div>
          <div className="map-legend">
            <span>
              <i className="legend-boundary" /> Watershed
            </span>
            <span>
              <i className="legend-water" /> Water body
            </span>
            <span>
              <i className="legend-intervention" /> Intervention
            </span>
            <span>
              <i className="legend-image" /> Field image
            </span>
          </div>
          <div className="map-attribution">
            © OpenStreetMap contributors <span>·</span> Demo spatial data
          </div>
        </div>
        <aside
          className={`detail-panel ${selected || point ? "has-selection" : ""}`}
        >
          <div className="panel-topline">
            <span className="eyebrow">
              {selected
                ? "WATERSHED PROFILE"
                : point
                  ? "LOCATION PROFILE"
                  : "MAP INSPECTOR"}
            </span>
            <button
              className="icon-btn small"
              onClick={() => {
                setSelected(null);
                setPoint(null);
              }}
            >
              <PanelRightClose size={16} />
            </button>
          </div>
          {selected ? (
            <WatershedPanel
              w={selected}
              onAnalysis={() => navigate("/spatial-analysis")}
            />
          ) : point && nearest ? (
            <LocationPanel
              point={point}
              w={nearest}
              onAnalysis={() => navigate("/spatial-analysis")}
            />
          ) : (
            <div className="empty-inspector">
              <div className="inspector-illustration">
                <MapIcon size={27} />
                <span className="pin-mini">
                  <MapIcon size={12} />
                </span>
              </div>
              <h3>Explore the map</h3>
              <p>
                Select a watershed boundary or click any point on the map to
                inspect local spatial data.
              </p>
              <div className="inspector-hint">
                <span>
                  <MouseIcon />
                </span>
                <div>
                  <b>Try clicking the map</b>
                  <small>Get coordinates and nearest watershed</small>
                </div>
              </div>
              <div className="inspector-divider" />
              <div className="quick-stat">
                <span>Visible watersheds</span>
                <b>{layers["Watershed boundaries"] ? 10 : 0}</b>
              </div>
              <div className="quick-stat">
                <span>Field photos in view</span>
                <b>{layers["Geo-coded images"] ? 16 : 0}</b>
              </div>
              <div className="quick-stat">
                <span>Data resolution</span>
                <b>
                  30 m <small>prototype</small>
                </b>
              </div>
              <div className="data-caveat">
                <ShieldCheck size={15} />
                <span>
                  All imagery and spatial overlays are <b>demonstration data</b>
                  .
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
      <div className="gis-foot">
        <span>
          <i className="status-dot" /> Spatial layers loaded{" "}
          <span className="separator">·</span> 10 watersheds{" "}
          <span className="separator">·</span> 30 m resolution concept
        </span>
        <span>
          Coordinates: WGS 84 <span className="separator">·</span> EPSG:4326
        </span>
      </div>
    </div>
  );
}
function dist(p: [number, number], w: Watershed) {
  return Math.hypot(p[0] - w.lat, p[1] - w.lng);
}
function CircleShape({ w, i }: { w: Watershed; i: number }) {
  return (
    <CircleMarker
      center={[w.lat + ((i % 3) - 1) * 0.025, w.lng + ((i % 4) - 1.5) * 0.027]}
      radius={i % 3 === 0 ? 7 : 5}
      pathOptions={{
        color: "#fff",
        weight: 1,
        fillColor: "#55a0bd",
        fillOpacity: 0.85,
      }}
    >
      <Popup>Water body · {w.name} Watershed</Popup>
    </CircleMarker>
  );
}
function MapClick({ onClick }: { onClick: (p: [number, number]) => void }) {
  useMapEvents({ click: (e) => onClick([e.latlng.lat, e.latlng.lng]) });
  return null;
}
function MapController({
  selected,
  point,
  defaultCenter,
  defaultZoom,
}: {
  selected: Watershed | null;
  point: [number, number] | null;
  defaultCenter: [number, number];
  defaultZoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    const zi = () => map.zoomIn(),
      zo = () => map.zoomOut(),
      reset = () => map.flyTo(defaultCenter, defaultZoom),
      resize = () => map.invalidateSize();
    window.addEventListener("map-resize", resize);
    window.addEventListener("map-zoom-in", zi);
    window.addEventListener("map-zoom-out", zo);
    window.addEventListener("map-reset", reset);
    if (selected)
      map.flyTo([selected.lat, selected.lng], 12, { duration: 0.7 });
    else if (point)
      map.flyTo(point, Math.max(map.getZoom(), 12), { duration: 0.7 });
    return () => {
      window.removeEventListener("map-zoom-in", zi);
      window.removeEventListener("map-zoom-out", zo);
      window.removeEventListener("map-reset", reset);
      window.removeEventListener("map-resize", resize);
    };
  }, [map, selected, point, defaultCenter[0], defaultCenter[1], defaultZoom]);
  return null;
}
function formatCoord(v: number, lat: boolean) {
  return `${Math.abs(v).toFixed(6)}° ${lat ? (v >= 0 ? "N" : "S") : v >= 0 ? "E" : "W"}`;
}
function WatershedPanel({
  w,
  onAnalysis,
}: {
  w: Watershed;
  onAnalysis: () => void;
}) {
  return (
    <>
      <div className="selected-cover">
        <div className="cover-overlay">
          <span className="selected-pill">
            <i /> ACTIVE WATERSHED
          </span>
          <div>
            <h2>
              {w.name}
              <br />
              Watershed
            </h2>
            <span>
              {w.district}, {w.state}
            </span>
          </div>
        </div>
        <div className="contour-art" />
      </div>
      <div className="panel-scroll">
        <div className="profile-id">
          <span>WATERSHED ID</span>
          <b>{w.id}</b>
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard?.writeText(w.id)}
          >
            <Check size={12} /> Copy
          </button>
        </div>
        <div className="profile-section">
          <div className="section-title">
            Watershed profile <MoreHorizontal size={16} />
          </div>
          <div className="profile-stats">
            <div>
              <span>Area</span>
              <b>
                {fmt(w.area)} <small>ha</small>
              </b>
            </div>
            <div>
              <span>Vegetation</span>
              <b>
                {w.veg}
                <small>%</small>
              </b>
            </div>
            <div>
              <span>Water area</span>
              <b>
                {w.water}
                <small>%</small>
              </b>
            </div>
            <div>
              <span>Interventions</span>
              <b>{w.interventions}</b>
            </div>
          </div>
        </div>
        <div className="profile-section">
          <div className="section-title">
            Center coordinates <span className="coordinate-system">WGS 84</span>
          </div>
          <div className="coord-row">
            <span>LATITUDE</span>
            <b>{formatCoord(w.lat, true)}</b>
          </div>
          <div className="coord-row">
            <span>LONGITUDE</span>
            <b>{formatCoord(w.lng, false)}</b>
          </div>
        </div>
        <div className="profile-section">
          <div className="section-title">
            Recent field images <a href="/geo-images">View all</a>
          </div>
          {images
            .filter((i) => i.watershedId === w.id)
            .slice(0, 2)
            .map((im) => (
              <div className="mini-image-row" key={im.id}>
                <img src={im.imageUrl} />
                <span>
                  <b>{im.title}</b>
                  <small>
                    {im.id} · {im.date}
                  </small>
                </span>
                <ChevronRight size={15} />
              </div>
            ))}
        </div>
        <div className="data-caveat">
          <ShieldCheck size={15} />
          <span>
            Statistics shown are <b>mock demonstration data</b>.
          </span>
        </div>
      </div>
      <button className="button primary full-button" onClick={onAnalysis}>
        View detailed analysis <ArrowRight size={15} />
      </button>
    </>
  );
}
function LocationPanel({
  point,
  w,
  onAnalysis,
}: {
  point: [number, number];
  w: Watershed;
  onAnalysis: () => void;
}) {
  return (
    <>
      <div className="location-heading">
        <div className="location-pin">
          <LocateFixed size={20} />
        </div>
        <div>
          <h2>Selected location</h2>
          <span>Map coordinates captured</span>
        </div>
      </div>
      <div className="panel-scroll location-scroll">
        <div className="profile-section">
          <div className="section-title">
            Coordinates <span className="coordinate-system">WGS 84</span>
          </div>
          <div className="coord-row">
            <span>LATITUDE</span>
            <b>{formatCoord(point[0], true)}</b>
          </div>
          <div className="coord-row">
            <span>LONGITUDE</span>
            <b>{formatCoord(point[1], false)}</b>
          </div>
        </div>
        <div className="nearby-card">
          <span className="nearby-label">
            <i /> NEAREST WATERSHED
          </span>
          <h3>{w.name} Watershed</h3>
          <p>
            {w.district}, {w.state} · {fmt(w.area)} ha
          </p>
          <div className="nearby-metrics">
            <span>
              <Leaf size={13} /> {w.veg}% vegetation
            </span>
            <span>
              <MapIcon size={13} /> {w.interventions} interventions
            </span>
          </div>
        </div>
        <div className="profile-section">
          <div className="section-title">Nearby spatial context</div>
          <div className="quick-stat">
            <span>Water area</span>
            <b>{w.water}%</b>
          </div>
          <div className="quick-stat">
            <span>Watershed status</span>
            <b className="green-text">Active</b>
          </div>
          <div className="quick-stat">
            <span>Spatial data</span>
            <b>Prototype</b>
          </div>
        </div>
        <div className="data-caveat">
          <ShieldCheck size={15} />
          <span>
            Coordinates from your selected map point; surrounding data is mock.
          </span>
        </div>
      </div>
      <button className="button primary full-button" onClick={onAnalysis}>
        View location analysis <ArrowRight size={15} />
      </button>
    </>
  );
}
function ImagesPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All types");
  const [watershedId, setWatershedId] = useState("All watersheds");
  const [district, setDistrict] = useState("All districts");
  const [dateFilter, setDateFilter] = useState("All dates");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploaded, setUploaded] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Check Dam");
  const [formWatershed, setFormWatershed] = useState(watersheds[0].id);
  const [captureDate, setCaptureDate] = useState(new Date().toISOString().slice(0, 10));
  const [latitude, setLatitude] = useState(String(watersheds[0].lat));
  const [longitude, setLongitude] = useState(String(watersheds[0].lng));
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    let active = true;
    loadSavedGeoImages()
      .then((records) => {
        if (!active) return;
        const restored = records.map(({ photo, ...metadata }) => {
          const imageUrl = URL.createObjectURL(photo);
          objectUrls.current.push(imageUrl);
          return { ...metadata, imageUrl };
        });
        setUploaded(restored);
      })
      .catch(() => setUploadMessage("Saved uploads are unavailable in this browser."));
    return () => {
      active = false;
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const allImages = [...uploaded, ...images];
  const list = allImages.filter((image) => {
    const matchesQuery = (image.title + image.category + image.watershed + image.district + image.id)
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesType = type === "All types" || image.category === type;
    const matchesWatershed = watershedId === "All watersheds" || image.watershedId === watershedId;
    const matchesDistrict = district === "All districts" || image.district === district;
    const matchesDate = dateFilter === "All dates" || imageMonthKey(image.date) === dateFilter;
    return matchesQuery && matchesType && matchesWatershed && matchesDistrict && matchesDate;
  });
  const activeFilterCount = [type !== "All types", watershedId !== "All watersheds", district !== "All districts", dateFilter !== "All dates"].filter(Boolean).length;

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setCategory("Check Dam");
    setFormWatershed(watersheds[0].id);
    setCaptureDate(new Date().toISOString().slice(0, 10));
    setLatitude(String(watersheds[0].lat));
    setLongitude(String(watersheds[0].lng));
    setUploadError("");
  };
  const submitImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!file || !file.type.startsWith("image/")) return setUploadError("Choose an image file to continue.");
    if (file.size > 10 * 1024 * 1024) return setUploadError("Image must be smaller than 10 MB.");
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) return setUploadError("Enter valid latitude and longitude values.");
    const w = watersheds.find((item) => item.id === formWatershed) || watersheds[0];
    const id = `UP-${Date.now().toString(36).toUpperCase()}`;
    const imageUrl = URL.createObjectURL(file);
    objectUrls.current.push(imageUrl);
    const record = { id, title: title.trim(), category, watershedId: w.id, watershed: w.name, district: w.district, lat, lng, date: formatDateInput(captureDate), imageUrl };
    setUploaded((current) => [record, ...current]);
    try {
      await saveGeoImage({ ...record, photo: file });
      setUploadMessage(`${record.title} added and saved to this browser.`);
    } catch {
      setUploadMessage(`${record.title} added for this session; browser storage was unavailable.`);
    }
    setShowAddForm(false);
    resetForm();
  };
  const clearFilters = () => { setType("All types"); setWatershedId("All watersheds"); setDistrict("All districts"); setDateFilter("All dates"); setQuery(""); };

  return (
    <div className="page">
      <PageHead eyebrow="FIELD EVIDENCE" title="Geo-Coded Images" subtitle="Field photographs connected to their precise watershed locations.">
        <button className={`button secondary ${showFilters ? "filter-active" : ""}`} onClick={() => setShowFilters((value) => !value)}><Filter size={15} /> Filters{activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}</button>
        <button className="button primary" onClick={() => { resetForm(); setShowAddForm(true); }}><Plus size={15} /> Add images</button>
      </PageHead>
      <div className="image-stats">
        <div><Camera size={17} /><span><b>{(4862 + uploaded.length).toLocaleString("en-IN")}</b><small>Total images</small></span></div>
        <div><MapIcon size={17} /><span><b>{watersheds.length}</b><small>Watersheds</small></span></div>
        <div><Check size={17} /><span><b>94.2%</b><small>Geotagged</small></span></div>
        <div><Activity size={17} /><span><b>{uploaded.length ? "Just now" : "Today"}</b><small>Last upload</small></span></div>
      </div>
      <div className="filters-row image-search-row">
        <div className="inline-search"><Search size={15} /><input placeholder="Search image, watershed or ID..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <span className="results-count">{list.length} images</span>
      </div>
      {showFilters && <div className="image-filter-panel">
        <label>IMAGE TYPE<select value={type} onChange={(e) => setType(e.target.value)}><option>All types</option>{["Check Dam", "Farm Pond", "Plantation", "Soil Conservation", "Water Harvesting"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>WATERSHED<select value={watershedId} onChange={(e) => setWatershedId(e.target.value)}><option>All watersheds</option>{watersheds.map((w) => <option key={w.id} value={w.id}>{w.name} Watershed</option>)}</select></label>
        <label>DISTRICT<select value={district} onChange={(e) => setDistrict(e.target.value)}><option>All districts</option>{[...new Set(watersheds.map((w) => w.district))].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>CAPTURE DATE<select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}><option>All dates</option>{[["2026-03", "Mar 2026"], ["2026-04", "Apr 2026"], ["2026-05", "May 2026"], ["2026-06", "Jun 2026"], ["2026-07", "Jul 2026"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button className="clear-filters" onClick={clearFilters}>Clear filters</button>
      </div>}
      {uploadMessage && <div className="success-banner image-upload-message"><Check size={15}/>{uploadMessage}<button onClick={() => setUploadMessage("")}><X size={14}/></button></div>}
      {list.length ? <div className="image-grid">{list.map((im) => (
        <button className="image-card" key={im.id} onClick={() => setSelected(im)}>
          <div className="image-thumb"><img src={im.imageUrl} alt={`${im.title} at ${im.watershed} Watershed`} /><span className="image-category">{im.category}</span><span className="image-id">{im.id}</span><span className="image-view"><Eye size={16} /></span></div>
          <div className="image-card-body"><b>{im.title} <span>· {im.watershed}</span></b><small><MapIcon size={12}/>{im.lat.toFixed(4)}°, {im.lng.toFixed(4)}° <i/> {im.date}</small></div>
        </button>
      ))}</div> : <div className="empty-images"><Camera size={23}/><b>No images match these filters</b><span>Change or clear the filters to see field images.</span><button className="button secondary" onClick={clearFilters}>Clear filters</button></div>}
      {selected && <div className="modal-scrim" onClick={() => setSelected(null)}><div className="image-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X size={18}/></button><img className="modal-photo" src={selected.imageUrl} alt={selected.title}/><div className="modal-content"><span className="eyebrow">GEO-CODED FIELD IMAGE · {selected.id}</span><h2>{selected.title}</h2><p>{selected.watershed} Watershed · {selected.district}, India</p><div className="modal-coordinates"><span>LATITUDE <b>{formatCoord(selected.lat, true)}</b></span><span>LONGITUDE <b>{formatCoord(selected.lng, false)}</b></span><span>CAPTURED <b>{selected.date}</b></span></div><div className="interpretation"><span><Activity size={16}/> Prototype AI interpretation</span><p><Check size={14}/> {selected.title} structure detected</p><p><Check size={14}/> Vegetation context available</p><small>Demo interpretation · Model confidence 89%</small></div><button className="button primary" onClick={() => (location.href = "/spatial-analysis")}>View spatial analysis <ArrowRight size={14}/></button></div></div></div>}
      {showAddForm && <div className="modal-scrim" onClick={() => setShowAddForm(false)}><form className="upload-modal" onClick={(e) => e.stopPropagation()} onSubmit={submitImage}>
        <div className="upload-modal-head"><div><span className="eyebrow">ADD FIELD EVIDENCE</span><h2>Upload geo-coded image</h2><p>Add a field photo and associate it with a watershed location.</p></div><button type="button" className="modal-close" onClick={() => setShowAddForm(false)}><X size={18}/></button></div>
        <label className="upload-dropzone"><Upload size={20}/><b>{file ? file.name : "Choose a photo to upload"}</b><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "JPG, PNG, or WebP · up to 10 MB"}</small><input type="file" accept="image/*" required onChange={(e) => { setFile(e.target.files?.[0] || null); setUploadError(""); }}/></label>
        <label className="upload-field">IMAGE TITLE<input required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Check dam inspection" /></label>
        <div className="upload-form-grid"><label className="upload-field">CATEGORY<select value={category} onChange={(e) => setCategory(e.target.value)}>{["Check Dam", "Farm Pond", "Plantation", "Soil Conservation", "Water Harvesting"].map((value) => <option key={value}>{value}</option>)}</select></label><label className="upload-field">WATERSHED<select value={formWatershed} onChange={(e) => {const id=e.target.value;setFormWatershed(id);const next=watersheds.find((item)=>item.id===id);if(next){setLatitude(String(next.lat));setLongitude(String(next.lng));}}}>{watersheds.map((w) => <option key={w.id} value={w.id}>{w.name} · {w.district}</option>)}</select></label></div>
        <div className="upload-form-grid"><label className="upload-field">LATITUDE<input type="number" step="any" min="-90" max="90" required value={latitude} onChange={(e) => setLatitude(e.target.value)} /></label><label className="upload-field">LONGITUDE<input type="number" step="any" min="-180" max="180" required value={longitude} onChange={(e) => setLongitude(e.target.value)} /></label></div>
        <label className="upload-field">CAPTURE DATE<input type="date" required value={captureDate} onChange={(e) => setCaptureDate(e.target.value)} /></label>
        {uploadError && <p className="upload-error">{uploadError}</p>}
        <div className="upload-actions"><button type="button" className="button secondary" onClick={() => setShowAddForm(false)}>Cancel</button><button type="submit" className="button primary"><Upload size={14}/> Add to gallery</button></div>
      </form></div>}
    </div>
  );
}
function formatDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function imageMonthKey(value: string) {
  const iso = value.match(/^(\d{4})-(\d{2})-/);
  if (iso) return `${iso[1]}-${iso[2]}`;
  const match = value.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i);
  if (!match) return "";
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].findIndex((name) => name.toLowerCase() === match[1].toLowerCase()) + 1;
  return `${match[2]}-${String(month).padStart(2, "0")}`;
}
type SavedWatershed = Watershed & { status: "Active" | "Under review" };
const CUSTOM_WATERSHEDS_KEY = "wi-custom-watersheds";
function getSavedWatersheds(): SavedWatershed[] {
  try {
    const value = JSON.parse(localStorage.getItem(CUSTOM_WATERSHEDS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function WatershedsPage() {
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("All states");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<SavedWatershed[]>(getSavedWatersheds);
  const [form, setForm] = useState({ name: "", district: "", state: "", area: "", veg: "", water: "", interventions: "", lat: "", lng: "", status: "Active" as SavedWatershed["status"] });
  const navigate = useNavigate();
  const allWatersheds: (Watershed & { status?: string })[] = [...watersheds, ...saved];
  const stateOptions = [...new Set(allWatersheds.map((w) => w.state))].sort();
  const filteredWatersheds = allWatersheds.filter((w) =>
    (w.name + " " + w.district + " " + w.state + " " + w.id).toLowerCase().includes(q.trim().toLowerCase()) &&
    (stateFilter === "All states" || w.state === stateFilter) &&
    (statusFilter === "All statuses" || (w.status || "Active") === statusFilter),
  );
  const activeFilterCount = [stateFilter !== "All states", statusFilter !== "All statuses"].filter(Boolean).length;
  const updateForm = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const resetForm = () => setForm({ name: "", district: "", state: "", area: "", veg: "", water: "", interventions: "", lat: "", lng: "", status: "Active" });
  const addWatershed = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const area = Number(form.area), veg = Number(form.veg), water = Number(form.water), interventionCount = Number(form.interventions), lat = Number(form.lat), lng = Number(form.lng);
    if ([area, veg, water, interventionCount, lat, lng].some((n) => !Number.isFinite(n)) || area <= 0 || veg < 0 || veg > 100 || water < 0 || water > 100 || interventionCount < 0 || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Enter a positive area, percentages from 0–100, and valid latitude/longitude coordinates.");
      return;
    }
    const slug = `${form.state.slice(0, 2)}-${form.district.slice(0, 3)}-${Date.now().toString().slice(-5)}`.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const item: SavedWatershed = {
      id: `WS-${slug}`, name: form.name.trim(), district: form.district.trim(), state: form.state.trim(), area,
      veg, water, interventions: Math.round(interventionCount), lat, lng, status: form.status,
      coordinates: [[lat + 0.02, lng - 0.02], [lat + 0.02, lng + 0.02], [lat - 0.02, lng + 0.02], [lat - 0.02, lng - 0.02]],
    };
    const next = [item, ...saved];
    try {
      localStorage.setItem(CUSTOM_WATERSHEDS_KEY, JSON.stringify(next));
      setSaved(next);
      setError("");
      setAddOpen(false);
      resetForm();
    } catch {
      setError("Could not save watershed in this browser. Check available storage and try again.");
    }
  };
  const clearFilters = () => { setQ(""); setStateFilter("All states"); setStatusFilter("All statuses"); };
  return (
    <div className="page">
      <PageHead
        eyebrow="WATERSHED INVENTORY"
        title="Watersheds"
        subtitle="Browse monitored catchments and their latest spatial indicators."
      >
        <button className={`button secondary ${filtersOpen ? "filter-active" : ""}`} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>
          <Filter size={15} /> Filter{activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>
        <button className="button primary" onClick={() => { setError(""); setAddOpen(true); }}>
          <Plus size={15} /> Add watershed
        </button>
      </PageHead>
      <div className="watershed-summary">
        <b>{128 + saved.length}</b>
        <span>watersheds monitored across 12 states</span>
        <span className="summary-chip">
          <ArrowUpRight size={13} /> 8 added this quarter
        </span>
      </div>
      <div className="filters-row">
        <div className="inline-search">
          <Search size={15} />
          <input
            placeholder="Search watershed or district..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
          <option>All states</option>
          {stateOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option>All statuses</option>
          <option>Active</option>
          <option>Under review</option>
        </select>
        <span className="results-count">Showing {filteredWatersheds.length} of {128 + saved.length}</span>
      </div>
      {filtersOpen && <div className="watershed-filter-panel"><span>{activeFilterCount ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}` : "Filter watershed list by state and status"}</span><button className="clear-filters" onClick={clearFilters}>Clear filters</button></div>}
      <div className="watershed-table-wrap">
        <table>
          <thead>
            <tr>
              <th>WATERSHED</th>
              <th>LOCATION</th>
              <th>AREA</th>
              <th>VEGETATION</th>
              <th>WATER AREA</th>
              <th>INTERVENTIONS</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredWatersheds.map((w, i) => (
              <tr
                key={w.id}
                onClick={() => navigate(`/watersheds/${w.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <div className="table-name-icon">
                    {i % 2 ? <Trees size={16} /> : <Waves size={16} />}
                  </div>
                  <div className="table-name">
                    <b>{w.name} Watershed</b>
                    <small>{w.id}</small>
                  </div>
                </td>
                <td>
                  {w.district}, {w.state}
                </td>
                <td>{fmt(w.area)} ha</td>
                <td>
                  <div className="progress-cell">
                    <span>
                      <i style={{ width: `${w.veg}%` }} />
                    </span>
                    <b>{w.veg}%</b>
                  </div>
                </td>
                <td>{w.water}%</td>
                <td>{w.interventions}</td>
                <td>
                  <span className="status-tag">
                    <i /> {w.status || "Active"}
                  </span>
                </td>
                <td>
                  <ChevronRight size={16} />
                </td>
              </tr>
            ))}
            {filteredWatersheds.length === 0 && <tr><td colSpan={8} className="watershed-empty">No watersheds match these filters. Clear the search or filters and try again.</td></tr>}
          </tbody>
        </table>
      </div>
      {addOpen && <div className="modal-scrim" onClick={() => { setAddOpen(false); setError(""); }}><form className="upload-modal" onSubmit={addWatershed} onClick={(event) => event.stopPropagation()}>
        <div className="upload-modal-head"><div><h2>Add watershed</h2><p>Add a catchment and its initial monitoring indicators.</p></div><button type="button" className="modal-close" onClick={() => { setAddOpen(false); setError(""); }} aria-label="Close"><X size={18}/></button></div>
        <label className="upload-field">WATERSHED NAME<input required maxLength={60} value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="e.g. Narmada Upper" /></label>
        <div className="upload-form-grid"><label className="upload-field">DISTRICT<input required maxLength={60} value={form.district} onChange={(event) => updateForm("district", event.target.value)} placeholder="District" /></label><label className="upload-field">STATE<input required maxLength={60} value={form.state} onChange={(event) => updateForm("state", event.target.value)} placeholder="State" /></label></div>
        <div className="upload-form-grid"><label className="upload-field">AREA (HA)<input required type="number" min="1" step="any" value={form.area} onChange={(event) => updateForm("area", event.target.value)} /></label><label className="upload-field">STATUS<select value={form.status} onChange={(event) => updateForm("status", event.target.value)}><option>Active</option><option>Under review</option></select></label></div>
        <div className="upload-form-grid"><label className="upload-field">VEGETATION (%)<input required type="number" min="0" max="100" step="any" value={form.veg} onChange={(event) => updateForm("veg", event.target.value)} /></label><label className="upload-field">WATER AREA (%)<input required type="number" min="0" max="100" step="any" value={form.water} onChange={(event) => updateForm("water", event.target.value)} /></label></div>
        <div className="upload-form-grid"><label className="upload-field">INTERVENTIONS<input required type="number" min="0" step="1" value={form.interventions} onChange={(event) => updateForm("interventions", event.target.value)} /></label><span /></div>
        <div className="upload-form-grid"><label className="upload-field">CENTER LATITUDE<input required type="number" min="-90" max="90" step="any" value={form.lat} onChange={(event) => updateForm("lat", event.target.value)} /></label><label className="upload-field">CENTER LONGITUDE<input required type="number" min="-180" max="180" step="any" value={form.lng} onChange={(event) => updateForm("lng", event.target.value)} /></label></div>
        {error && <p className="upload-error" role="alert">{error}</p>}
        <div className="upload-actions"><button type="button" className="button secondary" onClick={() => { setAddOpen(false); setError(""); }}>Cancel</button><button type="submit" className="button primary"><Plus size={14}/> Add watershed</button></div>
      </form></div>}
    </div>
  );
}
function Details() {
  const { id } = useParams();
  const w = [...watersheds, ...getSavedWatersheds()].find((x) => x.id === id) || watersheds[0];
  const navigate = useNavigate();
  return (
    <div className="page">
      <a href="/watersheds" className="back-link">
        <ChevronLeft size={14} /> Watersheds
      </a>
      <PageHead
        eyebrow="WATERSHED PROFILE"
        title={`${w.name} Watershed`}
        subtitle={`${w.district}, ${w.state} · ${w.id}`}
      >
        <button className="button secondary">
          <Download size={15} /> Export
        </button>
        <button className="button primary" onClick={() => navigate("/gis")}>
          Open in GIS <MapIcon size={15} />
        </button>
      </PageHead>
      <div className="detail-kpis">
        <div>
          <span>Area</span>
          <b>{fmt(w.area)} ha</b>
        </div>
        <div>
          <span>Vegetation coverage</span>
          <b>{w.veg}%</b>
        </div>
        <div>
          <span>Water area</span>
          <b>{w.water}%</b>
        </div>
        <div>
          <span>Mapped interventions</span>
          <b>{w.interventions}</b>
        </div>
        <div>
          <span>Status</span>
          <b className="green-text">● Active</b>
        </div>
      </div>
      <AnalysisInner w={w} />
    </div>
  );
}
function Analysis() {
  const [selectedId, setSelectedId] = useState(watersheds[0].id);
  const w = watersheds.find((item) => item.id === selectedId) || watersheds[0];
  return (
    <div className="page">
      <PageHead
        eyebrow="REMOTE SENSING · DEMONSTRATION"
        title="Watershed Spatial Analysis"
        subtitle={`Prototype indicators for ${w.name} Watershed · ${w.district}, ${w.state} · ${w.id}`}
      >
        <select
          className="head-select"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {watersheds.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} Watershed · {item.district}
            </option>
          ))}
        </select>
        <span className="data-badge">
          <i /> MOCK ANALYSIS
        </span>
      </PageHead>
      <AnalysisInner w={w} />
    </div>
  );
}
function AnalysisInner({ w }: { w: Watershed }) {
  const analysis = getWatershedAnalysis(w);
  const landUseColors = ["#d0a464", "#549570", "#5394b4", "#c67b65", "#9297a0"];
  const landUseData = analysis.landUse.map((item, index) => ({
    ...item,
    color: landUseColors[index],
  }));
  return (
    <>
      <div className="analysis-highlight">
        <div className="highlight-mark">
          <Leaf size={19} />
        </div>
        <div>
          <span>VEGETATION COVERAGE · DEMO NDVI PROXY</span>
          <h2>
            {w.veg}% <small>of watershed area</small>
          </h2>
          <p>
            <b>
              <ArrowUpRight size={13} /> +{analysis.vegetationChange}%
            </b>{" "}
            compared with 2024 baseline
          </p>
        </div>
        <div className="spark-chart">
          <ResponsiveContainer>
            <AreaChart data={analysis.monthly}>
              <Area
                dataKey="vegetation"
                stroke="#3d8b61"
                fill="#c9e0d0"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="improving-tag">
          <TrendingUp size={14} /> {w.veg >= 40 ? "Improving" : "Monitor"}
        </div>
      </div>
      <div className="analysis-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Land use distribution</h3>
              <p>Thematic classification · prototype data</p>
            </div>
            <button className="icon-btn small">
              <MoreHorizontal size={17} />
            </button>
          </div>
          <div className="land-chart-row">
            <div className="land-chart">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={landUseData.map(({ name, value }) => ({ n: name, v: value }))}
                    dataKey="v"
                    innerRadius={56}
                    outerRadius={75}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {landUseData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <b>{fmt(w.area)}</b>
                <small>hectares</small>
              </div>
            </div>
            <div className="land-legend">
              {landUseData.map(({ name, value, color }) => (
                <div key={name}>
                  <span>
                    <i style={{ background: color }} />
                    {name}
                  </span>
                  <b>{value}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Water resources</h3>
              <p>Surface water indicators · demo data</p>
            </div>
            <Droplets size={17} className="muted-icon" />
          </div>
          <div className="water-total">
            <b>
              {fmt(analysis.waterAreaHa)} <small>ha</small>
            </b>
            <span>Estimated water area</span>
            <em>
              <ArrowUpRight size={13} /> +{analysis.waterChange}% seasonal change
            </em>
          </div>
          <div className="water-mini-chart">
            <ResponsiveContainer>
              <BarChart data={analysis.monthly}>
                <XAxis
                  dataKey="m"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                />
                <Bar dataKey="waterArea" fill="#72a9bb" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="water-breakdown">
            <span>
              Water bodies <b>{analysis.waterBodies}</b>
            </span>
            <span>
              Seasonal <b>{analysis.seasonalWaterBodies}</b>
            </span>
          </div>
        </div>
        <div className="panel full-span">
          <div className="panel-heading">
            <div>
              <h3>Spatial indicators over time</h3>
              <p>
                Vegetation cover and surface water trend · illustrative monthly
                series
              </p>
            </div>
            <button className="select-button">
              2026 <ChevronDown size={13} />
            </button>
          </div>
          <div className="chart analysis-trend">
            <ResponsiveContainer>
              <LineChart
                data={analysis.monthly}
                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="var(--grid)"
                />
                <XAxis
                  dataKey="m"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                />
                <ChartTip />
                <Line
                  dataKey="vegetation"
                  name="Vegetation (%)"
                  stroke="#4f946c"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  dataKey="waterIndex"
                  name="Water coverage (%)"
                  stroke="#5997b4"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Drainage characteristics</h3>
              <p>Derived network indicators</p>
            </div>
            <Activity size={17} className="muted-icon" />
          </div>
          <div className="drainage-number">
            {analysis.drainage.total} <small>km</small>
          </div>
          <div className="muted-label">Total drainage length</div>
          <div className="drainage-rows">
            <span>
              Primary drainage <b>{analysis.drainage.primary} km</b>
            </span>
            <span>
              Secondary drainage <b>{analysis.drainage.secondary} km</b>
            </span>
            <span>
              Drainage density <b>{analysis.drainage.density} km/km²</b>
            </span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Mapped interventions</h3>
              <p>Field-verified assets</p>
            </div>
            <a className="text-link" href="/gis">
              View map <ArrowRight size={13} />
            </a>
          </div>
          <div className="intervention-list">
            {analysis.interventions.map(({ name, count }, i) => (
              <div key={name}>
                <span className={`intervention-symbol int-${i}`}>
                  {i === 0 ? (
                    <Waves size={14} />
                  ) : i === 1 ? (
                    <Droplets size={14} />
                  ) : i === 2 ? (
                    <Activity size={14} />
                  ) : (
                    <Trees size={14} />
                  )}
                </span>
                <b>{name}</b>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="prototype-note">
        <ShieldCheck size={16} />
        <span>
          <b>Prototype analysis.</b> Values are mock demonstration data. No live
          SRISHTI-DRISHTI satellite feed or trained computer vision model is
          connected.
        </span>
        <a href="/gis">
          Inspect spatial layers <ArrowRight size={13} />
        </a>
      </div>
    </>
  );
}
function Change() {
  return (
    <div className="page">
      <PageHead
        eyebrow="TEMPORAL ANALYSIS"
        title="Spatial Change Detection"
        subtitle="Compare watershed indicators across reporting periods."
      >
        <span className="data-badge">
          <i /> DEMO COMPARISON
        </span>
      </PageHead>
      <div className="compare-controls">
        <span>COMPARE PERIODS</span>
        <button>
          Before <b>2024 season</b>
          <ChevronDown size={14} />
        </button>
        <ArrowRight size={16} />
        <button>
          After <b>2026 season</b>
          <ChevronDown size={14} />
        </button>
        <button className="button secondary">
          <Layers size={14} /> Change layers
        </button>
      </div>
      <div className="compare-map">
        <div className="compare-side before">
          <span>BEFORE · 2024</span>
          <div className="abstract-map map-before">
            <div className="map-grid-lines" />
            <i className="contour c1" />
            <i className="contour c2" />
            <i className="contour c3" />
            <div className="compare-stat">
              <small>VEGETATION COVER</small>
              <b>29%</b>
              <span>Rampur Watershed</span>
            </div>
          </div>
        </div>
        <div className="compare-divider">
          <span>↔</span>
        </div>
        <div className="compare-side after">
          <span>AFTER · 2026</span>
          <div className="abstract-map map-after">
            <div className="map-grid-lines" />
            <i className="contour c1" />
            <i className="contour c2" />
            <i className="contour c3" />
            <div className="change-patch" />
            <div className="compare-stat">
              <small>VEGETATION COVER</small>
              <b>41%</b>
              <span>Rampur Watershed</span>
            </div>
          </div>
        </div>
      </div>
      <div className="change-kpis">
        <div>
          <span>Vegetation coverage</span>
          <b>
            +12.0 <small>percentage points</small>
          </b>
          <em>
            <ArrowUpRight size={13} /> Improved
          </em>
        </div>
        <div>
          <span>Water area</span>
          <b>
            +18% <small>estimated change</small>
          </b>
          <em>
            <ArrowUpRight size={13} /> Increased
          </em>
        </div>
        <div>
          <span>Interventions mapped</span>
          <b>
            +24 <small>since 2024</small>
          </b>
          <em>
            <ArrowUpRight size={13} /> Added
          </em>
        </div>
        <div>
          <span>Degraded areas</span>
          <b>
            3 <small>areas flagged</small>
          </b>
          <em className="orange-text">
            <ArrowDownRight size={13} /> Review required
          </em>
        </div>
      </div>
      <div className="prototype-note">
        <ShieldCheck size={16} />
        <span>
          <b>Illustrative change analysis.</b> 2024 and 2026 values are mock
          demo data for product evaluation.
        </span>
      </div>
    </div>
  );
}
function Analytics() {
  const [state, setState] = useState("All states");
  const [district, setDistrict] = useState("All districts");
  const [period, setPeriod] = useState("Jan — Sep 2026");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const states = [...new Set(watersheds.map((w) => w.state))];
  const districts = [...new Set(watersheds.filter((w) => state === "All states" || w.state === state).map((w) => w.district))];
  const filteredWatersheds = watersheds.filter((w) =>
    (state === "All states" || w.state === state) &&
    (district === "All districts" || w.district === district),
  );
  const analysis = filteredWatersheds.map((w) => ({ watershed: w, metrics: getWatershedAnalysis(w) }));
  const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const isPreviousSeason = period === "2025";
  const averageVegetation = average(analysis.map(({ watershed: w, metrics }) =>
    isPreviousSeason ? Math.max(0, w.veg - metrics.vegetationChange) : w.veg,
  ));
  const totalWaterBodies = analysis.reduce((sum, row) => sum + row.metrics.waterBodies, 0);
  const totalInterventions = filteredWatersheds.reduce((sum, w) => sum + w.interventions, 0);
  const monitoredArea = filteredWatersheds.reduce((sum, w) => sum + w.area, 0);
  const monthlyData = filteredWatersheds.length
    ? chartData.map((month, index) => ({
        ...month,
        water: Number(average(analysis.map((row) => {
          const currentIndex = row.metrics.monthly[index]?.waterIndex || 0;
          return isPreviousSeason
            ? currentIndex * (1 - row.metrics.waterChange / 100)
            : currentIndex;
        })).toFixed(1)),
      }))
    : [];
  const clearFilters = () => { setState("All states"); setDistrict("All districts"); setPeriod("Jan — Sep 2026"); };
  const exportAnalytics = () => {
    const rows = [
      ["Watershed", "Watershed ID", "District", "State", "Area (ha)", "Vegetation (%)", "Water coverage (%)", "Water bodies", "Interventions", "Period"],
      ...analysis.map(({ watershed: w, metrics }) => [w.name, w.id, w.district, w.state, String(w.area), String(isPreviousSeason ? Math.max(0, w.veg - metrics.vegetationChange) : w.veg), String(w.water), String(metrics.waterBodies), String(w.interventions), period]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\r\n");
    downloadBlob(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }), `watershed-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
  };
  return (
    <div className="page">
      <PageHead
        eyebrow="CROSS-WATERSHED INSIGHTS"
        title="Watershed Analytics"
        subtitle="Compare vegetation, water resources and interventions across regions."
      >
        <button className={`button secondary ${filtersOpen ? "filter-active" : ""}`} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>
          <Filter size={15} /> Filters <ChevronDown size={13} />
        </button>
        <button className="button primary" onClick={exportAnalytics} disabled={!filteredWatersheds.length}>
          <Download size={15} /> Export
        </button>
      </PageHead>
      {filtersOpen && <div className="analytics-filters">
        <label>
          STATE
          <select value={state} onChange={(event) => { setState(event.target.value); setDistrict("All districts"); }}>
            <option>All states</option>
            {states.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          DISTRICT
          <select value={district} onChange={(event) => setDistrict(event.target.value)}>
            <option>All districts</option>
            {districts.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label>
          PERIOD
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option>Jan — Sep 2026</option>
            <option>2025</option>
          </select>
        </label>
        <button className="clear-filters" onClick={clearFilters}>Clear filters</button>
        <span className="data-badge">
          <i /> MOCK DATASET
        </span>
      </div>}
      <div className="analytics-kpis">
        <div>
          <span>Avg. vegetation coverage</span>
          <b>{averageVegetation.toFixed(1)}%</b>
          <em>
            <ArrowUpRight size={13} /> +4.6%
          </em>
        </div>
        <div>
          <span>Total water bodies</span>
          <b>{fmt(totalWaterBodies)}</b>
          <em>
            <ArrowUpRight size={13} /> +3.1%
          </em>
        </div>
        <div>
          <span>Interventions verified</span>
          <b>{fmt(totalInterventions)}</b>
          <em>
            <ArrowUpRight size={13} /> +6.8%
          </em>
        </div>
        <div>
          <span>Monitored area</span>
          <b>
            {fmt(monitoredArea)} <small>ha</small>
          </b>
          <em>Across 128 basins</em>
        </div>
      </div>
      <div className="analysis-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Vegetation by watershed</h3>
              <p>Current seasonal coverage · percent</p>
            </div>
            <MoreHorizontal size={16} />
          </div>
          <div className="chart analytic-chart">
            <ResponsiveContainer>
              <BarChart
                data={filteredWatersheds.slice(0, 7)}
                layout="vertical"
                margin={{ left: 15, right: 15 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  width={96}
                />
                <ChartTip />
                <Bar dataKey="veg" radius={[0, 4, 4, 0]}>
                  {filteredWatersheds.slice(0, 7).map((w, i) => (
                    <Cell fill={i === 0 ? "#468c65" : "#8fbaa0"} key={w.id} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Water area trend</h3>
              <p>Relative surface water index</p>
            </div>
            <MoreHorizontal size={16} />
          </div>
          <div className="chart analytic-chart">
            <ResponsiveContainer>
              <AreaChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="var(--grid)"
                />
                <XAxis
                  dataKey="m"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                />
                <YAxis hide />
                <ChartTip />
                <Area
                  dataKey="water"
                  stroke="#619db4"
                  fill="#dcecf0"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Intervention count</h3>
              <p>Mapped assets by watershed</p>
            </div>
            <MoreHorizontal size={16} />
          </div>
          <div className="chart analytic-chart">
            <ResponsiveContainer>
              <BarChart data={filteredWatersheds.slice(0, 7)}>
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="var(--grid)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 9 }}
                />
                <YAxis hide />
                <ChartTip />
                <Bar
                  dataKey="interventions"
                  fill="#c8a36d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>District comparison</h3>
              <p>Vegetation coverage by district</p>
            </div>
            <MoreHorizontal size={16} />
          </div>
          <div className="comparison-list">
            {filteredWatersheds.slice(0, 5).map((w) => (
              <div key={w.id}>
                <span>{w.district}</span>
                <i>
                  <b style={{ width: `${w.veg}%` }} />
                </i>
                <strong>{w.veg}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="prototype-note">
        <ShieldCheck size={16} />
        <span>
          Filtered prototype indicators for the selected region and period. 2025 values are illustrative estimates; figures are not sourced from live satellite imagery.
        </span>
      </div>
    </div>
  );
}
function Reports() {
  const [watershedId, setWatershedId] = useState(watersheds[0].id),
    [period, setPeriod] = useState(localStorage.getItem("wi-reporting-period") || "2026 season to date"),
    [generated, setGenerated] = useState(false),
    [previewReady, setPreviewReady] = useState(false),
    [sections, setSections] = useState<Record<string, boolean>>({
      "Watershed overview": true,
      "Land use & vegetation": true,
      "Water resources": true,
      "Drainage analysis": true,
      Interventions: true,
      "Geo-coded image summary": true,
      "Spatial change detection": true,
    });
  const w = watersheds.find((x) => x.id === watershedId) || watersheds[0];
  const imageCount = images.filter((x) => x.watershedId === w.id).length;
  const selected = Object.entries(sections)
    .filter(([, on]) => on)
    .map(([name]) => name);
  const rows: [string, string][] = [
    ["Watershed", `${w.name} Watershed`],
    ["Watershed ID", w.id],
    ["District", w.district],
    ["State", w.state],
    ["Reporting period", period],
  ];
  if (sections["Watershed overview"])
    rows.push(
      ["Area", `${fmt(w.area)} ha`],
      ["Center latitude", formatCoord(w.lat, true)],
      ["Center longitude", formatCoord(w.lng, false)],
      ["Status", "Active"],
    );
  if (sections["Land use & vegetation"])
    rows.push(
      ["Agriculture", "38%"],
      ["Vegetation coverage", `${w.veg}%`],
      ["Vegetation change since 2024", "+12.4% (prototype estimate)"],
      ["Barren land", "9%"],
      ["Built-up area", "5%"],
    );
  if (sections["Water resources"])
    rows.push(
      ["Water area", `${Math.round((w.area * w.water) / 100)} ha`],
      ["Water coverage", `${w.water}%`],
      ["Water bodies", "20 (demo count)"],
      ["Water area change", "+18% (prototype estimate)"],
    );
  if (sections["Drainage analysis"])
    rows.push(
      ["Total drainage length", "86.4 km (mock)"],
      ["Primary drainage", "24.8 km (mock)"],
      ["Secondary drainage", "61.6 km (mock)"],
      ["Drainage density", "0.35 km/km² (mock)"],
    );
  if (sections["Interventions"])
    rows.push(
      ["Mapped interventions", String(w.interventions)],
      ["Check dams", "Mock inventory"],
      ["Farm ponds", "Mock inventory"],
      ["Other intervention types", "Contour trenches and plantation areas"],
    );
  if (sections["Geo-coded image summary"])
    rows.push(
      ["Geo-coded images", `${imageCount} sample records`],
      [
        "Image categories",
        "Check dam, farm pond, plantation, soil conservation, water harvesting",
      ],
    );
  if (sections["Spatial change detection"])
    rows.push(
      ["Vegetation change", "+12.4% prototype estimate"],
      ["Water area change", "+18% prototype estimate"],
      ["New interventions", "+24 prototype estimate"],
      ["Areas flagged for review", "3 demo areas"],
    );
  const safeName = w.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const previewReport = () => {
    setGenerated(false);
    setPreviewReady(true);
  };
  const generateReport = () => {
    setPreviewReady(true);
    setGenerated(true);
  };
  const makeCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [["Field", "Value"], ...rows]
      .map((row) => row.map((v) => esc(String(v))).join(","))
      .join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `watershed-${safeName}-assessment.csv`);
    setPreviewReady(true);
    setGenerated(true);
  };
  const makePdf = () => {
    const rawLines: string[] = [
      "WATERSHED INSIGHT · ASSESSMENT REPORT",
      "PROTOTYPE / DEMONSTRATION DATA",
      "",
      `${w.name} Watershed`,
      `${w.district}, ${w.state} · ${w.id}`,
      `Reporting period: ${period}`,
      "",
      ...selected.flatMap((name) => {
        const matches = rows.filter(
          ([key]) =>
            key === "Watershed" ||
            key === "Watershed ID" ||
            key === "District" ||
            key === "State" ||
            key === "Reporting period" ||
            (name === "Watershed overview" &&
              [
                "Area",
                "Center latitude",
                "Center longitude",
                "Status",
              ].includes(key)) ||
            (name === "Land use & vegetation" &&
              [
                "Agriculture",
                "Vegetation coverage",
                "Vegetation change since 2024",
                "Barren land",
                "Built-up area",
              ].includes(key)) ||
            (name === "Water resources" &&
              [
                "Water area",
                "Water coverage",
                "Water bodies",
                "Water area change",
              ].includes(key)) ||
            (name === "Drainage analysis" &&
              [
                "Total drainage length",
                "Primary drainage",
                "Secondary drainage",
                "Drainage density",
              ].includes(key)) ||
            (name === "Interventions" &&
              [
                "Mapped interventions",
                "Check dams",
                "Farm ponds",
                "Other intervention types",
              ].includes(key)) ||
            (name === "Geo-coded image summary" &&
              ["Geo-coded images", "Image categories"].includes(key)) ||
            (name === "Spatial change detection" &&
              [
                "Vegetation change",
                "Water area change",
                "New interventions",
                "Areas flagged for review",
              ].includes(key)),
        );
        return [
          `${name.toUpperCase()}`,
          ...matches
            .filter(
              ([key]) =>
                ![
                  "Watershed",
                  "Watershed ID",
                  "District",
                  "State",
                  "Reporting period",
                ].includes(key),
            )
            .map(([key, val]) => `${key}: ${val}`),
          "",
        ];
      }),
      "Executive note: Values in this report are mock data for prototype demonstration.",
      "No live SRISHTI-DRISHTI feed or production AI model is connected.",
    ];
    const lines = rawLines.flatMap((line) => {
      const ascii = line
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, " ");
      if (!ascii) return [""];
      const out: string[] = [];
      let rest = ascii;
      while (rest.length > 88) {
        let cut = rest.lastIndexOf(" ", 88);
        if (cut < 40) cut = 88;
        out.push(rest.slice(0, cut));
        rest = rest.slice(cut).trimStart();
      }
      out.push(rest);
      return out;
    });
    const chunks = Array.from(
      { length: Math.ceil(lines.length / 40) },
      (_, i) => lines.slice(i * 40, (i + 1) * 40),
    );
    const enc = new TextEncoder();
    const escPdf = (t: string) =>
      t.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const objs: string[] = [];
    objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    const pageIds = chunks.map((_, i) => 4 + i * 2);
    objs[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${chunks.length} >>`;
    objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
    chunks.forEach((chunk, i) => {
      const pageId = pageIds[i],
        contentId = pageId + 1;
      let stream =
        "BT /F1 17 Tf 48 790 Td (Watershed Assessment Report) Tj /F1 9 Tf 0 -22 Td (WATERSHED INSIGHT  |  PROTOTYPE DATA) Tj";
      chunk.forEach((line, j) => {
        stream += ` 0 -16 Td (${escPdf(line)}) Tj`;
      });
      stream += ` ET BT /F1 8 Tf 48 30 Td (Generated ${new Date().toLocaleDateString("en-IN")}  |  Page ${i + 1} of ${chunks.length}  |  Mock demonstration data) Tj ET`;
      objs[pageId] =
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
      objs[contentId] =
        `<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}\nendstream`;
    });
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    for (let id = 1; id < objs.length; id++) {
      offsets[id] = enc.encode(pdf).length;
      pdf += `${id} 0 obj\n${objs[id]}\nendobj\n`;
    }
    const xref = enc.encode(pdf).length;
    pdf += `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objs.length; id++)
      pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    downloadBlob(
      new Blob([pdf], { type: "application/pdf" }),
      `watershed-${safeName}-assessment.pdf`,
    );
    setPreviewReady(true);
    setGenerated(true);
  };
  return (
    <div className="page">
      <PageHead
        eyebrow="ASSESSMENT & EXPORT"
        title="Watershed Reports"
        subtitle="Generate, preview, and download a watershed assessment."
      >
        <button className="button secondary" onClick={makeCsv}>
          <Download size={15} /> Export CSV
        </button>
        <button className="button secondary" onClick={makePdf}>
          <Download size={15} /> Download PDF
        </button>
        <button className="button primary" onClick={generateReport}>
          <FileText size={15} /> Generate report
        </button>
      </PageHead>
      {generated && (
        <div className="success-banner">
          <Check size={16} /> Report ready for {w.name} Watershed ·{" "}
          {selected.length} sections included{" "}
          <button onClick={() => setGenerated(false)}>
            <X size={14} />
          </button>
        </div>
      )}
      <div className="report-layout">
        <div className="panel report-settings">
          <span className="eyebrow">REPORT CONFIGURATION</span>
          <h3>Watershed assessment</h3>
          <p>
            Choose a watershed, reporting period, and sections. Select Preview report to review it, then Generate report when it is ready.
          </p>
          <label>
            WATERSHED
            <select
              value={watershedId}
              onChange={(e) => {
                setWatershedId(e.target.value);
                setGenerated(false);
                setPreviewReady(false);
              }}
            >
              {watersheds.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} Watershed — {x.district}
                </option>
              ))}
            </select>
          </label>
          <label>
            REPORTING PERIOD
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setGenerated(false);
                setPreviewReady(false);
              }}
            >
              <option>2026 season to date</option>
              <option>2025 full year</option>
              <option>2024 baseline</option>
            </select>
          </label>
          <div className="report-sections">
            {Object.keys(sections).map((name, i) => (
              <label key={name}>
                <input
                  type="checkbox"
                  checked={sections[name]}
                  disabled={i === 0}
                  onChange={() => {
                    setSections((prev) => ({ ...prev, [name]: !prev[name] }));
                    setGenerated(false);
                    setPreviewReady(false);
                  }}
                />
                <span>{name}</span>
                {i === 0 && <small>Required</small>}
              </label>
            ))}
          </div>
          <button
            className="button secondary full-button"
            onClick={previewReport}
          >
            <Eye size={15} /> Preview report
          </button>
        </div>
        <div className="report-preview">
          {!previewReady ? <div className="report-empty"><FileText size={27}/><h3>Report preview</h3><p>Choose the watershed, reporting period, and sections, then select <b>Preview report</b>.</p></div> :
          <div className="report-paper">
            <div className="report-brand">
              <span>
                <Waves size={17} />
              </span>
              <b>
                WATERSHED
                <br />
                INSIGHT
              </b>
              <small>ASSESSMENT REPORT · DEMO</small>
            </div>
            <div className="report-rule" />
            <span className="eyebrow">
              WATERSHED ASSESSMENT · {period.toUpperCase()}
            </span>
            <h2>{w.name} Watershed</h2>
            <p className="report-location">
              {w.district} District · {w.state}, India
            </p>
            <div className="report-metrics">
              <div>
                <small>WATERSHED ID</small>
                <b>{w.id}</b>
              </div>
              <div>
                <small>AREA</small>
                <b>{fmt(w.area)} ha</b>
              </div>
              <div>
                <small>STATUS</small>
                <b>Active</b>
              </div>
            </div>
            <h4>Executive summary</h4>
            <p>
              {w.name} Watershed covers {fmt(w.area)} hectares in {w.district},{" "}
              {w.state}. Prototype indicators show {w.veg}% vegetation coverage,{" "}
              {w.water}% water-area coverage, and {w.interventions} recorded
              interventions. All figures are illustrative mock data.
            </p>
            {selected.map((name, i) => (
              <div className="report-preview-section" key={name}>
                <h4>{name}</h4>
                <p>
                  {rows
                    .filter(([key]) => {
                      const group: Record<string, string[]> = {
                        "Watershed overview": [
                          "Area",
                          "Center latitude",
                          "Center longitude",
                          "Status",
                        ],
                        "Land use & vegetation": [
                          "Agriculture",
                          "Vegetation coverage",
                          "Vegetation change since 2024",
                          "Barren land",
                          "Built-up area",
                        ],
                        "Water resources": [
                          "Water area",
                          "Water coverage",
                          "Water bodies",
                          "Water area change",
                        ],
                        "Drainage analysis": [
                          "Total drainage length",
                          "Primary drainage",
                          "Secondary drainage",
                          "Drainage density",
                        ],
                        Interventions: [
                          "Mapped interventions",
                          "Check dams",
                          "Farm ponds",
                          "Other intervention types",
                        ],
                        "Geo-coded image summary": [
                          "Geo-coded images",
                          "Image categories",
                        ],
                        "Spatial change detection": [
                          "Vegetation change",
                          "Water area change",
                          "New interventions",
                          "Areas flagged for review",
                        ],
                      };
                      return (group[name] || []).includes(key);
                    })
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(" · ")}
                </p>
              </div>
            ))}
            <div className="report-caveat">
              Prototype report. Mock demonstration data only; no live satellite
              feed or production AI interpretation is connected.
            </div>
            <div className="report-footer">
              WATERSHED INSIGHT{" "}
              <span>
                {selected.length} sections · {period}
              </span>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
type StoredGeoImage = {
  id: string;
  title: string;
  category: string;
  watershedId: string;
  watershed: string;
  district: string;
  lat: number;
  lng: number;
  date: string;
  photo: Blob;
};
function openGeoImageDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }
    const request = indexedDB.open("watershed-insight-gallery", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("images")) {
        request.result.createObjectStore("images", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open image storage"));
  });
}
async function loadSavedGeoImages(): Promise<StoredGeoImage[]> {
  const db = await openGeoImageDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("images", "readonly");
    const request = transaction.objectStore("images").getAll();
    request.onsuccess = () => resolve(request.result as StoredGeoImage[]);
    request.onerror = () => reject(request.error || new Error("Could not load saved images"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error("Could not read saved images")); };
  });
}
async function saveGeoImage(image: StoredGeoImage & { imageUrl?: string }): Promise<void> {
  const db = await openGeoImageDatabase();
  const { imageUrl: _imageUrl, ...storedRecord } = image;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("images", "readwrite");
    transaction.objectStore("images").put(storedRecord);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error("Could not save image")); };
    transaction.onabort = () => { db.close(); reject(transaction.error || new Error("Image save was cancelled")); };
  });
}
function SettingsPage({
  dark,
  setDark,
  profile,
  setProfile,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  profile: { name: string; role: string };
  setProfile: (value: { name: string; role: string }) => void;
}) {
  const tabs = [
    { name: "General", icon: Globe2 },
    { name: "Appearance", icon: Palette },
    { name: "Data & sources", icon: Database },
    { name: "Notifications", icon: BellRing },
    { name: "Account", icon: UserRound },
  ];
  const [activeTab, setActiveTab] = useState(() =>
    new URLSearchParams(window.location.search).get("tab") === "Account"
      ? "Account"
      : "General",
  );
  const [homeId, setHomeId] = useState(
    localStorage.getItem("wi-home-watershed") || watersheds[0].id,
  );
  const [period, setPeriod] = useState(
    localStorage.getItem("wi-reporting-period") || "2026 season to date",
  );
  const [mapLabels, setMapLabels] = useState(
    localStorage.getItem("wi-map-labels") !== "false",
  );
  const [inAppAlerts, setInAppAlerts] = useState(
    localStorage.getItem("wi-in-app-alerts") !== "false",
  );
  const [emailDigest, setEmailDigest] = useState(
    localStorage.getItem("wi-email-digest") === "true",
  );
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [savedMessage, setSavedMessage] = useState("");

  const savePreference = (key: string, value: string) => {
    localStorage.setItem(key, value);
    setSavedMessage("Preference saved on this device.");
    window.setTimeout(() => setSavedMessage(""), 2400);
  };
  const toggle = (value: boolean, onChange: (next: boolean) => void) => (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      className={`toggle ${value ? "on" : ""}`}
      onClick={() => onChange(!value)}
    >
      <i />
    </button>
  );
  const downloadSample = () => {
    const csv = [
      ["Watershed ID", "Name", "District", "State", "Area (ha)", "Vegetation (%)", "Water area (%)", "Interventions"],
      ...watersheds.map((w) => [w.id, w.name, w.district, w.state, String(w.area), String(w.veg), String(w.water), String(w.interventions)]),
    ].map((row) => row.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")).join("\r\n");
    downloadBlob(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), "watershed-insight-demo-data.csv");
  };
  const saveProfile = () => {
    const next = { name: name.trim() || "Watershed Administrator", role: role.trim() || "Watershed Administrator" };
    setProfile(next);
    localStorage.setItem("wi-profile", JSON.stringify(next));
    setName(next.name);
    setRole(next.role);
    setSavedMessage("Profile saved.");
    window.setTimeout(() => setSavedMessage(""), 2400);
  };
  const resetPreferences = () => {
    localStorage.removeItem("wi-home-watershed");
    localStorage.removeItem("wi-reporting-period");
    setHomeId(watersheds[0].id);
    setPeriod("2026 season to date");
    setSavedMessage("General preferences reset. Reopen GIS to use the default view.");
    window.setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <div className="page">
      <PageHead eyebrow="PREFERENCES" title="Settings" subtitle="Configure your workspace and visualization preferences." />
      <div className="settings-layout">
        <div className="settings-nav" role="tablist" aria-label="Settings sections">
          {tabs.map(({ name: tab, icon: Icon }) => (
            <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
              <Icon size={15} />{tab}
            </button>
          ))}
        </div>
        <div className="panel settings-panel" role="tabpanel">
          {activeTab === "General" && <>
            <div className="settings-section-head"><h3>Workspace defaults</h3><p>These choices are remembered in this browser and used when you return to the relevant page.</p></div>
            <label className="settings-field"><span><b>Default GIS watershed</b><small>GIS Explorer opens centred on this watershed.</small></span><select value={homeId} onChange={(e) => { setHomeId(e.target.value); savePreference("wi-home-watershed", e.target.value); }}>
              {watersheds.map((w) => <option key={w.id} value={w.id}>{w.name} — {w.district}, {w.state}</option>)}
            </select></label>
            <label className="settings-field"><span><b>Default reporting period</b><small>Used as the initial period on the Reports page.</small></span><select value={period} onChange={(e) => { setPeriod(e.target.value); savePreference("wi-reporting-period", e.target.value); }}>
              <option>2026 season to date</option><option>2025 full year</option><option>2024 baseline</option>
            </select></label>
            <div className="settings-action-row"><button className="button secondary" onClick={resetPreferences}>Reset general preferences</button>{savedMessage && <span className="settings-saved"><Check size={13}/>{savedMessage}</span>}</div>
          </>}
          {activeTab === "Appearance" && <>
            <div className="settings-section-head"><h3>Appearance</h3><p>Adjust the interface and GIS map display.</p></div>
            <div className="setting-row"><span><b>Dark mode</b><small>Use the dark color palette across the workspace.</small></span>{toggle(dark, setDark)}</div>
            <div className="setting-row"><span><b>Watershed map labels</b><small>Show area and vegetation details when hovering over boundaries.</small></span>{toggle(mapLabels, (next) => { setMapLabels(next); savePreference("wi-map-labels", String(next)); })}</div>
            <div className="settings-hint"><Palette size={15}/> Theme changes apply immediately and are saved automatically.</div>
            {savedMessage && <span className="settings-saved"><Check size={13}/>{savedMessage}</span>}
          </>}
          {activeTab === "Data & sources" && <>
            <div className="settings-section-head"><h3>Data & sources</h3><p>Review the data represented in this prototype.</p></div>
            <div className="source-callout"><ShieldCheck size={17}/><span><b>Demonstration data active</b><small>No live satellite feed or production image model is connected.</small></span><span className="data-badge"><i/> PROTOTYPE</span></div>
            <div className="setting-row"><span><b>Satellite data concept</b><small>SRISHTI-DRISHTI · 30 m resolution concept</small></span><span className="disabled-tag">Mock data</span></div>
            <div className="setting-row"><span><b>Map basemap</b><small>OpenStreetMap tiles · EPSG:4326</small></span><span className="source-status"><i/> Available</span></div>
            <div className="setting-row"><span><b>Sample watershed records</b><small>10 watershed examples in the local prototype dataset.</small></span><button className="button secondary" onClick={downloadSample}><Download size={14}/> Download CSV</button></div>
          </>}
          {activeTab === "Notifications" && <>
            <div className="settings-section-head"><h3>Notifications</h3><p>Choose which alert types you want enabled in this browser.</p></div>
            <div className="setting-row"><span><b>In-app monitoring alerts</b><small>Vegetation change, water updates, and new field images.</small></span>{toggle(inAppAlerts, (next) => { setInAppAlerts(next); savePreference("wi-in-app-alerts", String(next)); })}</div>
            <div className="setting-row"><span><b>Weekly email digest</b><small>Preference only; email delivery is not connected in this prototype.</small></span>{toggle(emailDigest, (next) => { setEmailDigest(next); savePreference("wi-email-digest", String(next)); })}</div>
            <div className="settings-hint"><BellRing size={15}/> Notification preferences are stored locally. No messages are sent externally.</div>
            {savedMessage && <span className="settings-saved"><Check size={13}/>{savedMessage}</span>}
          </>}
          {activeTab === "Account" && <>
            <div className="settings-section-head"><h3>Account profile</h3><p>Update the local profile shown in the navigation bar.</p></div>
            <label className="settings-field"><span><b>Display name</b><small>Shown in your sidebar and account avatar.</small></span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>
            <label className="settings-field"><span><b>Role</b><small>Workspace role label.</small></span><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Your role" /></label>
            <div className="settings-action-row"><button className="button primary" onClick={saveProfile}><Save size={14}/> Save profile</button>{savedMessage && <span className="settings-saved"><Check size={13}/>{savedMessage}</span>}</div>
          </>}
        </div>
      </div>
    </div>
  );
}
const cameraIcon = L.divIcon({
    className: "custom-div-icon",
    html: '<div class="map-marker photo-marker"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="12" cy="12" r="3"/><path d="m8 5 1-2h6l1 2"/></svg></div>',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  }),
  interventionIcon = L.divIcon({
    className: "custom-div-icon",
    html: '<div class="map-marker intervention-marker"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M12 3v18M3 12h18"/></svg></div>',
    iconSize: [23, 23],
    iconAnchor: [11, 11],
  }),
  pondIcon = L.divIcon({
    className: "custom-div-icon",
    html: '<div class="map-marker pond-marker"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17c3-3 5 3 9 0s6 3 9 0M3 11c3-3 5 3 9 0s6 3 9 0"/></svg></div>',
    iconSize: [23, 23],
    iconAnchor: [11, 11],
  }),
  selectedIcon = L.divIcon({
    className: "custom-div-icon",
    html: '<div class="selected-marker"><span></span></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
function MouseIcon() {
  return <span className="mouse-shape" />;
}
export default App;
