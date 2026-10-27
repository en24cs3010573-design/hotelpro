import React, { useState } from 'react';
import { HousekeepingTask, Room, RoomStatus } from '../../types/hotel';
import { useHotel } from '../../context/HotelContext';
import {
  Bed,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  Edit2,
  Filter,
  Layers,
  ListTodo,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react';

export const OperationsHousekeepingView: React.FC = () => {
  const {
    rooms,
    updateRoomStatus,
    updateRoomPricing,
    addNewRoom,
    housekeepingTasks,
    updateTaskStatus,
    toggleChecklistItem,
    assignHousekeeping,
    config,
    updateConfig,
  } = useHotel();

  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'tasks' | 'pricing'>('matrix');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');

  // Task assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRoomId, setAssignRoomId] = useState(rooms[0]?.id || '');
  const [assignStaff, setAssignStaff] = useState('Maria Santos');
  const [assignPriority, setAssignPriority] = useState<HousekeepingTask['priority']>('high');
  const [assignNotes, setAssignNotes] = useState('');

  // Add Room modal
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState(2);
  const [newCategory, setNewCategory] = useState('Deluxe Ocean View Terrace');
  const [newBasePrice, setNewBasePrice] = useState(380);
  const [newBeds, setNewBeds] = useState('1 California King Bed');

  // Pricing edit modal
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editBasePrice, setEditBasePrice] = useState(0);
  const [editWeekendRate, setEditWeekendRate] = useState(0);

  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => b - a);

  const displayedRooms = rooms.filter((r) =>
    selectedFloor === 'all' ? true : r.floor === selectedFloor
  );

  const statusColorMap: Record<RoomStatus, { bg: string; text: string; border: string }> = {
    available: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    occupied: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    dirty: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    cleaning: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    maintenance: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
    inspected: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    assignHousekeeping(assignRoomId, assignStaff, assignPriority, assignNotes);
    setShowAssignModal(false);
    setAssignNotes('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) return;

    addNewRoom({
      roomNumber: newRoomNumber,
      floor: newFloor,
      category: newCategory,
      roomType: newCategory.includes('Suite') ? 'suite' : 'deluxe',
      basePrice: newBasePrice,
      weekendRate: Math.round(newBasePrice * 1.15),
      capacity: { adults: 2, children: 1 },
      beds: newBeds,
      sizeSqFt: 580,
      amenities: ['Ocean Terrace', 'Rainfall Shower', 'Wi-Fi 6', 'Nespresso Atelier'],
      status: 'available',
      imageUrl: '/src/assets/images/room_deluxe_ocean_1793036093151.jpg',
      gallery: ['/src/assets/images/room_deluxe_ocean_1793036093151.jpg'],
      description: 'Elegant contemporary guest room with premium fixtures and serene interior styling.',
    });

    setShowAddRoomModal(false);
    setNewRoomNumber('');
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    updateRoomPricing(editingRoom.id, editBasePrice, editWeekendRate);
    setEditingRoom(null);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
            Operations Management
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
            Room Inventory & Housekeeping
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time floor matrix, housekeeping turnover checklists, and dynamic room pricing configurations.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'matrix'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Floor Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'tasks'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Turnover Tasks ({housekeepingTasks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('pricing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'pricing'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Pricing & Inventory
          </button>
        </div>
      </div>

      {/* Subtab 1: Floor Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          {/* Floor filter bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  selectedFloor === 'all'
                    ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All Floors ({rooms.length})
              </button>
              {floors.map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    selectedFloor === fl
                      ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Floor {fl}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Occupied
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Dirty
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> In Cleaning
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Maintenance
              </span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedRooms.map((room) => {
              const style = statusColorMap[room.status];
              return (
                <div
                  key={room.id}
                  className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs hover:shadow-xs transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xl font-bold font-mono text-neutral-900">
                        {room.roomNumber}
                      </span>
                      <span className="text-[11px] text-neutral-500 block">
                        Floor {room.floor} · {room.beds}
                      </span>
                    </div>

                    {/* Status Pill with Dropdown */}
                    <select
                      value={room.status}
                      onChange={(e) => updateRoomStatus(room.id, e.target.value as RoomStatus)}
                      className={`text-xs font-bold px-2 py-1 rounded-md border cursor-pointer focus:outline-none capitalize ${style.bg} ${style.text} ${style.border}`}
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="dirty">Dirty</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inspected">Inspected</option>
                    </select>
                  </div>

                  <p className="text-xs text-neutral-700 font-medium truncate">
                    {room.category}
                  </p>

                  {room.currentGuest ? (
                    <div className="p-2 rounded bg-neutral-50 border border-neutral-100 text-[11px]">
                      <span className="font-semibold text-neutral-900 block truncate">
                        {room.currentGuest.name}
                      </span>
                      <span className="text-neutral-500 font-mono text-[10px]">
                        Ref: {room.currentGuest.bookingId} · Out: {room.currentGuest.checkOutDate}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-400">
                      No active occupant
                    </div>
                  )}

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                      ${room.basePrice}/night
                    </span>
                    <button
                      onClick={() => {
                        setAssignRoomId(room.id);
                        setShowAssignModal(true);
                      }}
                      className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 hover:underline"
                    >
                      Assign Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 2: Turnover Tasks */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Housekeeping Turnover Schedule
              </h2>
              <p className="text-xs text-neutral-500">
                Turnover workflows and sanitation checklists
              </p>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {housekeepingTasks.map((task) => {
              const isCompleted = task.status === 'completed' || task.status === 'inspected';
              const completedCount = task.checklist.filter((i) => i.done).length;
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-neutral-900">
                          Room {task.roomNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            task.priority === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                        className="text-xs font-semibold px-2 py-1 rounded border border-neutral-200 bg-neutral-50 capitalize"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="inspected">Inspected</option>
                      </select>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-neutral-700">{task.category}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Assigned to: <span className="font-semibold text-neutral-800">{task.assignedStaffName}</span>
                      </p>
                    </div>

                    {task.notes && (
                      <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-150 leading-relaxed">
                        {task.notes}
                      </p>
                    )}

                    {/* Interactive Checklist */}
                    <div>
                      <div className="flex justify-between items-center text-[11px] text-neutral-500 mb-2">
                        <span>Checklist Completion</span>
                        <span className="font-mono font-bold text-neutral-900">
                          {completedCount} / {task.checklist.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {task.checklist.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleChecklistItem(task.id, item.id)}
                            className="flex items-start gap-2 text-xs cursor-pointer select-none group"
                          >
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-neutral-900 cursor-pointer"
                            />
                            <span
                              className={`leading-snug transition ${
                                item.done ? 'line-through text-neutral-400' : 'text-neutral-700 group-hover:text-neutral-900'
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Updated: {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isCompleted && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Room Sanitized
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 3: Pricing & Inventory */}
      {activeSubTab === 'pricing' && (
        <div className="space-y-6">
          
          {/* Global Seasonal Multiplier Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Dynamic Seasonal Pricing Engine</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Apply platform-wide price multipliers for holiday weekends or peak tourism periods.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-700">Multiplier:</span>
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
                  {[
                    { label: 'Normal (1.0x)', val: 1.0 },
                    { label: 'Peak Weekend (+15%)', val: 1.15 },
                    { label: 'Holiday Surge (+30%)', val: 1.3 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => updateConfig({ seasonalMultiplier: preset.val })}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                        config.seasonalMultiplier === preset.val
                          ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rooms Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Room Inventory List</h3>
                <p className="text-xs text-neutral-500">Edit base prices and weekend rate surcharges</p>
              </div>
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-2xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room Unit</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Room #</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Floor / Size</th>
                    <th className="px-5 py-3">Base Price</th>
                    <th className="px-5 py-3">Weekend Rate</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-neutral-50/80 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-neutral-900">
                        {room.roomNumber}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-neutral-900">
                        {room.category}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600">
                        Floor {room.floor} · {room.sizeSqFt} sq ft
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-neutral-900 tabular-nums">
                        ${room.basePrice}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-neutral-600 tabular-nums">
                        ${room.weekendRate}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setEditingRoom(room);
                            setEditBasePrice(room.basePrice);
                            setEditWeekendRate(room.weekendRate);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Rates</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-sm">Assign Housekeeping Task</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Select Room</label>
                <select
                  value={assignRoomId}
                  onChange={(e) => setAssignRoomId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({r.category}) - {r.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Assigned Staff</label>
                <select
                  value={assignStaff}
                  onChange={(e) => setAssignStaff(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                >
                  <option value="Maria Santos">Maria Santos (Floor 1-3 Lead)</option>
                  <option value="David Miller">David Miller (Reception & Dispatch)</option>
                  <option value="Carlos Ruiz">Carlos Ruiz (Suite Specialist)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Priority</label>
                <select
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                >
                  <option value="urgent">Urgent (VIP Check-in imminent)</option>
                  <option value="high">High (Departure Turnover)</option>
                  <option value="normal">Normal (Daily Refresh)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Turnover Notes</label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Special instructions for staff (e.g. extra champagne flutes, allergen-free feather pillows)..."
                  rows={3}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3.5 py-1.5 text-neutral-700 bg-neutral-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-white bg-neutral-900 rounded-lg font-semibold shadow-2xs"
                >
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rates Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Update Rates</h3>
                <p className="text-xs text-neutral-500">Room {editingRoom.roomNumber} ({editingRoom.category})</p>
              </div>
              <button
                onClick={() => setEditingRoom(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Standard Nightly Rate ($)</label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  value={editBasePrice}
                  onChange={(e) => setEditBasePrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 font-mono border border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Weekend Surge Rate ($)</label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  value={editWeekendRate}
                  onChange={(e) => setEditWeekendRate(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 font-mono border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-3 py-1.5 text-neutral-700 bg-neutral-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-white bg-neutral-900 rounded-lg font-semibold shadow-2xs"
                >
                  Save Rates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-sm">Add Room to Inventory</h3>
              <button
                onClick={() => setShowAddRoomModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Room Number</label>
                  <input
                    type="text"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="e.g. 504"
                    required
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Floor Level</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Suite Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                >
                  <option value="Presidential Penthouse Suite">Presidential Penthouse Suite</option>
                  <option value="Deluxe Ocean View Terrace">Deluxe Ocean View Terrace</option>
                  <option value="Executive Double Studio">Executive Double Studio</option>
                  <option value="Superior King Garden Room">Superior King Garden Room</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Base Nightly Price ($)</label>
                <input
                  type="number"
                  min="100"
                  step="25"
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Bed Configuration</label>
                <input
                  type="text"
                  value={newBeds}
                  onChange={(e) => setNewBeds(e.target.value)}
                  required
                  placeholder="e.g. 1 California King Bed"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-3.5 py-1.5 text-neutral-700 bg-neutral-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-white bg-neutral-900 rounded-lg font-semibold shadow-2xs"
                >
                  Add Room Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
