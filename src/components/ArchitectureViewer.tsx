import React, { useEffect, useState } from 'react';
import {
  Database,
  Table,
  CheckCircle2,
  Server,
  Code2,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Cpu,
  Sparkles,
} from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'er-tables' | 'api-spec' | 'live-check' | 'roadmap'>('er-tables');
  const [selectedTable, setSelectedTable] = useState<string>('pgs');
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isCallingApi, setIsCallingApi] = useState(false);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/api/system/health');
      const data = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setHealthData({ status: 'error', error: err.message });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const testApi = async (endpoint: string) => {
    setIsCallingApi(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiResponse({ endpoint, status: res.status, data });
    } catch (err: any) {
      setApiResponse({ endpoint, status: 500, error: err.message });
    } finally {
      setIsCallingApi(false);
    }
  };

  // 11 PostgreSQL Tables definition with fields and constraints
  const tableDefinitions: Record<string, { desc: string; columns: Array<{ name: string; type: string; key?: string; note?: string }> }> = {
    users: {
      desc: 'Users and hosts directory synchronized with Firebase Auth',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'uid', type: 'text', key: 'UK', note: 'Firebase Auth UID (Unique)' },
        { name: 'name', type: 'text', note: 'Full user/host name' },
        { name: 'email', type: 'text', note: 'Email address' },
        { name: 'phone', type: 'text', note: 'Mobile contact' },
        { name: 'role', type: 'text', note: 'USER | OWNER | ADMIN' },
        { name: 'avatar', type: 'text', note: 'Profile picture URL' },
        { name: 'created_at', type: 'timestamp', note: 'Account creation' },
        { name: 'updated_at', type: 'timestamp', note: 'Last profile update' },
      ],
    },
    pgs: {
      desc: 'Paying Guest properties and coliving listings',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'owner_id', type: 'integer', key: 'FK', note: 'References users(id) ON DELETE CASCADE' },
        { name: 'name', type: 'text', note: 'Property title' },
        { name: 'tagline', type: 'text', note: 'Catchy marketing phrase' },
        { name: 'description', type: 'text', note: 'Detailed description' },
        { name: 'gender_type', type: 'text', note: 'BOYS | GIRLS | COED' },
        { name: 'city', type: 'text', note: 'Hyderabad, Bangalore, etc.' },
        { name: 'address', type: 'text', note: 'Full physical address' },
        { name: 'locality', type: 'text', note: 'Neighborhood / Tech Park' },
        { name: 'latitude', type: 'double precision', note: 'Map latitude' },
        { name: 'longitude', type: 'double precision', note: 'Map longitude' },
        { name: 'monthly_rent', type: 'integer', note: 'Starting price/month' },
        { name: 'security_deposit', type: 'integer', note: 'Refundable deposit' },
        { name: 'notice_period_days', type: 'integer', note: 'Default 30 days' },
        { name: 'available_beds', type: 'integer', note: 'Real-time open beds' },
        { name: 'total_beds', type: 'integer', note: 'Total building capacity' },
        { name: 'verification_status', type: 'text', note: 'PENDING | VERIFIED | REJECTED' },
        { name: 'rules', type: 'text', note: 'JSON string array of rules' },
        { name: 'food_included', type: 'boolean', note: 'True if meals provided' },
        { name: 'rating', type: 'real', note: 'Average rating (0 - 5)' },
        { name: 'review_count', type: 'integer', note: 'Total review count' },
      ],
    },
    rooms: {
      desc: 'Room inventories and occupancy options within a PG',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'pg_id', type: 'integer', key: 'FK', note: 'References pgs(id) ON DELETE CASCADE' },
        { name: 'room_type', type: 'text', note: 'SINGLE | DOUBLE | TRIPLE | FOUR_SHARING' },
        { name: 'rent', type: 'integer', note: 'Rent per bed in INR' },
        { name: 'total_beds', type: 'integer', note: 'Capacity of this room' },
        { name: 'available_beds', type: 'integer', note: 'Vacant beds right now' },
        { name: 'has_attached_bathroom', type: 'boolean', note: 'Private washroom' },
        { name: 'has_balcony', type: 'boolean', note: 'Private balcony' },
        { name: 'has_ac', type: 'boolean', note: 'Air conditioning fitted' },
        { name: 'description', type: 'text', note: 'Room specific perks' },
      ],
    },
    amenities: {
      desc: 'Master dictionary of amenities with icons',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'name', type: 'text', key: 'UK', note: 'Unique amenity name' },
        { name: 'icon', type: 'text', note: 'Lucide icon identifier' },
        { name: 'category', type: 'text', note: 'ESSENTIAL | COMFORT | SAFETY | FACILITY' },
      ],
    },
    pg_amenities: {
      desc: 'Many-to-many junction between PGs and Amenities',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'pg_id', type: 'integer', key: 'FK', note: 'References pgs(id)' },
        { name: 'amenity_id', type: 'integer', key: 'FK', note: 'References amenities(id)' },
      ],
    },
    pg_images: {
      desc: 'Image gallery photos for PG properties',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'pg_id', type: 'integer', key: 'FK', note: 'References pgs(id)' },
        { name: 'image_url', type: 'text', note: 'CDN / Cloudinary URL' },
        { name: 'caption', type: 'text', note: 'Photo caption / room tag' },
        { name: 'is_primary', type: 'boolean', note: 'Featured hero image flag' },
      ],
    },
    bookings: {
      desc: 'Room booking requests and lease tracking',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'user_id', type: 'integer', key: 'FK', note: 'References users(id)' },
        { name: 'pg_id', type: 'integer', key: 'FK', note: 'References pgs(id)' },
        { name: 'room_id', type: 'integer', key: 'FK', note: 'References rooms(id)' },
        { name: 'status', type: 'text', note: 'PENDING | ACCEPTED | REJECTED | CANCELLED | COMPLETED' },
        { name: 'move_in_date', type: 'text', note: 'Target check-in date' },
        { name: 'sharing_type', type: 'text', note: 'Selected bed type' },
        { name: 'message', type: 'text', note: 'Note from tenant' },
        { name: 'owner_note', type: 'text', note: 'Host feedback' },
      ],
    },
    visits: {
      desc: 'Scheduled in-person property visits',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'user_id', type: 'integer', key: 'FK', note: 'References users(id)' },
        { name: 'pg_id', type: 'integer', key: 'FK', note: 'References pgs(id)' },
        { name: 'visit_date', type: 'text', note: 'Scheduled date' },
        { name: 'visit_time', type: 'text', note: 'Time slot' },
        { name: 'status', type: 'text', note: 'PENDING | CONFIRMED | COMPLETED | CANCELLED' },
      ],
    },
    favorites: {
      desc: 'User wishlists and bookmarked properties',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'user_id', type: 'integer', key: 'FK', note: 'References users(id)' },
        { name: 'pg_id', type: 'integer', key: 'FK', note: 'References pgs(id)' },
      ],
    },
    reviews: {
      desc: 'Ratings, feedback and reviews from verified residents',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'user_id', type: 'integer', key: 'FK', note: 'References users(id)' },
        { name: 'pg_id', type: 'integer', key: 'FK', note: 'References pgs(id)' },
        { name: 'rating', type: 'integer', note: '1 to 5 star rating' },
        { name: 'cleanliness_rating', type: 'integer', note: '1 to 5' },
        { name: 'food_rating', type: 'integer', note: '1 to 5' },
        { name: 'comment', type: 'text', note: 'Written feedback' },
      ],
    },
    notifications: {
      desc: 'User and owner alert notifications',
      columns: [
        { name: 'id', type: 'serial', key: 'PK', note: 'Primary Key' },
        { name: 'user_id', type: 'integer', key: 'FK', note: 'References users(id)' },
        { name: 'title', type: 'text', note: 'Notification header' },
        { name: 'message', type: 'text', note: 'Body text' },
        { name: 'type', type: 'text', note: 'BOOKING | VISIT | VERIFICATION | INFO' },
        { name: 'is_read', type: 'boolean', note: 'Read receipt' },
      ],
    },
  };

  const tableList = Object.keys(tableDefinitions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/60 border border-purple-500/30 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/30">
              <Database className="w-3.5 h-3.5" />
              Phase 1 Deliverable — Architecture & Schema Foundation
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              System Architecture & PostgreSQL ER Model
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Normalized relational database running on <strong>Google Cloud SQL (PostgreSQL)</strong>,
              synchronized with <strong>Firebase Auth</strong> and powered by <strong>Drizzle ORM</strong>.
            </p>
          </div>

          {/* Cloud SQL Live Health Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-w-[240px] shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" /> Cloud SQL Status
              </span>
              <button
                onClick={fetchHealth}
                disabled={isLoadingHealth}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh Health"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingHealth ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {healthData ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-emerald-300 uppercase">
                    {healthData.status}
                  </span>
                  <span className="text-xs text-slate-400">({healthData.database})</span>
                </div>
                {healthData.counts && (
                  <div className="mt-2 text-[11px] text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-800/80 pt-2">
                    <div>PGs: <strong className="text-white">{healthData.counts.pgs}</strong></div>
                    <div>Rooms: <strong className="text-white">{healthData.counts.rooms}</strong></div>
                    <div>Amenities: <strong className="text-white">{healthData.counts.amenities}</strong></div>
                    <div>Users: <strong className="text-white">{healthData.counts.users}</strong></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500">Checking Cloud SQL...</div>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('er-tables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'er-tables'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            PostgreSQL Schema (11 Tables)
          </button>
          <button
            onClick={() => setActiveTab('api-spec')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'api-spec'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            REST API Blueprint
          </button>
          <button
            onClick={() => setActiveTab('live-check')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'live-check'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Live REST API Tester
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'roadmap'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Phased Roadmap (1 to 9)
          </button>
        </div>
      </div>

      {/* Tab 1: PostgreSQL Schema Inspector */}
      {activeTab === 'er-tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table List Sidebar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Normalized Tables ({tableList.length})
            </h3>
            <div className="space-y-1">
              {tableList.map((tableName) => (
                <button
                  key={tableName}
                  onClick={() => setSelectedTable(tableName)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                    selectedTable === tableName
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Table className="w-3.5 h-3.5 text-purple-400" />
                    {tableName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {tableDefinitions[tableName].columns.length} cols
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Schema Details */}
          <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-xl text-white">
                    public.{selectedTable}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active in Cloud SQL
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {tableDefinitions[selectedTable]?.desc}
                </p>
              </div>
            </div>

            {/* Columns Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Column Name</th>
                    <th className="py-2.5 px-3">PostgreSQL Type</th>
                    <th className="py-2.5 px-3">Key / Constraint</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {tableDefinitions[selectedTable]?.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 text-indigo-300 font-semibold">{col.name}</td>
                      <td className="py-2 px-3 text-slate-300">{col.type}</td>
                      <td className="py-2 px-3">
                        {col.key === 'PK' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            PRIMARY KEY
                          </span>
                        )}
                        {col.key === 'UK' && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                            UNIQUE
                          </span>
                        )}
                        {col.key === 'FK' && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                            FOREIGN KEY
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-sans">{col.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: REST API Blueprint */}
      {activeTab === 'api-spec' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-display font-bold text-lg text-white mb-4">
            Production REST API Specification
          </h3>
          <div className="space-y-3">
            {[
              { method: 'GET', path: '/api/pgs', desc: 'Search PGs by city, price range, gender, room types, verified badge' },
              { method: 'GET', path: '/api/pgs/:id', desc: 'Get PG property full details including rooms, amenities, photos, and reviews' },
              { method: 'POST', path: '/api/pgs', desc: 'PG Owner multi-step property creation with inventory & photos' },
              { method: 'GET', path: '/api/pgs/:id/rooms', desc: 'List room configurations & available beds for a property' },
              { method: 'POST', path: '/api/bookings', desc: 'Submit room booking request' },
              { method: 'GET', path: '/api/bookings/my', desc: 'List current user bookings' },
              { method: 'GET', path: '/api/bookings/owner', desc: 'List bookings for owner PGs with approval actions' },
              { method: 'PUT', path: '/api/bookings/:id/status', desc: 'Update booking status (ACCEPTED, REJECTED, CANCELLED)' },
              { method: 'GET', path: '/api/favorites', desc: 'Retrieve current user wishlist' },
              { method: 'POST', path: '/api/favorites', desc: 'Add PG to favorites' },
              { method: 'DELETE', path: '/api/favorites/:pgId', desc: 'Remove PG from favorites' },
              { method: 'GET', path: '/api/reviews/pg/:id', desc: 'Fetch user reviews and ratings' },
              { method: 'POST', path: '/api/reviews/pg/:id', desc: 'Submit rating, cleanliness score, food score and comment' },
              { method: 'POST', path: '/api/visits', desc: 'Schedule an in-person site visit' },
              { method: 'GET', path: '/api/system/health', desc: 'Cloud SQL connection health & table counts' },
              { method: 'GET', path: '/api/system/stats', desc: 'Aggregated statistics for platform hero' },
            ].map((api) => (
              <div
                key={api.path + api.method}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 gap-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      api.method === 'GET'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : api.method === 'POST'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : api.method === 'PUT'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {api.method}
                  </span>
                  <span className="font-mono text-xs text-indigo-300 font-semibold">{api.path}</span>
                </div>
                <div className="text-xs text-slate-400">{api.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Live REST API Tester */}
      {activeTab === 'live-check' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-display font-bold text-lg text-white mb-2">
            Live REST API Execution
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Execute real HTTP requests against the backend server and Cloud SQL database right now.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => testApi('/api/system/health')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              GET /api/system/health
            </button>
            <button
              onClick={() => testApi('/api/pgs?city=Hyderabad')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              GET /api/pgs?city=Hyderabad
            </button>
            <button
              onClick={() => testApi('/api/system/amenities')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              GET /api/system/amenities
            </button>
            <button
              onClick={() => testApi('/api/pgs/1')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              GET /api/pgs/1
            </button>
          </div>

          {isCallingApi && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying Cloud SQL PostgreSQL...
            </div>
          )}

          {apiResponse && !isCallingApi && (
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                <span className="font-mono text-xs text-indigo-300 font-semibold">
                  {apiResponse.endpoint}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  HTTP {apiResponse.status}
                </span>
              </div>
              <pre className="text-xs text-emerald-400 font-mono overflow-x-auto max-h-96 p-2 bg-slate-900/60 rounded-lg">
                {JSON.stringify(apiResponse.data || apiResponse.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-display font-bold text-lg text-white mb-4">
            Master Development Roadmap
          </h3>
          <div className="space-y-4">
            {[
              { phase: 'Phase 1', title: 'Architecture, Schema, Cloud SQL & REST API Foundation', status: 'COMPLETED' },
              { phase: 'Phase 2', title: 'Authentication and Role System (User, Owner, Admin)', status: 'NEXT' },
              { phase: 'Phase 3', title: 'Owner PG Registration & Room Management Wizard', status: 'PENDING' },
              { phase: 'Phase 4', title: 'User PG Discovery, Search, and Multi-filter Grid', status: 'PENDING' },
              { phase: 'Phase 5', title: 'Google Maps & Places API Nearby Explorer', status: 'PENDING' },
              { phase: 'Phase 6', title: 'Bookings, Favorites, Visits and Verified Reviews', status: 'PENDING' },
              { phase: 'Phase 7', title: 'Owner Analytics Dashboard (Occupancy & Revenue)', status: 'PENDING' },
              { phase: 'Phase 8', title: '3D Interactive City Experience (Three.js / R3F)', status: 'PENDING' },
              { phase: 'Phase 9', title: 'Production Security, Audits, and Final Deployment', status: 'PENDING' },
            ].map((item) => (
              <div
                key={item.phase}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : item.status === 'NEXT'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.status === 'COMPLETED' ? '✓' : item.phase.split(' ')[1]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.phase}: {item.title}</div>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'NEXT'
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 animate-pulse'
                        : 'bg-slate-800/60 text-slate-500'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
