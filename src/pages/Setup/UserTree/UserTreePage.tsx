import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    RefreshCw,
    MapPin,
    Building,
    DoorOpen,
    Shield,
    Users,
    Edit,
    Eye
} from 'lucide-react';
// IMPORTING THE API FUNCTIONS YOU REQUESTED
import { getBuildings, getFloors, getSetupUsers, getUnits } from '../../../api';

// Types
interface Option {
    id: string | number;
    name: string;
}

interface UserRow {
    id: string;
    name: string;
    mobile: string;
    email: string;
    building: string;
    floor: string;
    unit: string;
    ownership: string;
    units_count: number;
}

const UserTreePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    // Filter States
    const [selectedBuilding, setSelectedBuilding] = useState<string>('');
    const [selectedFloor, setSelectedFloor] = useState<string>('');
    const [selectedUnit, setSelectedUnit] = useState<string>('');
    const [memberType, setMemberType] = useState<string>('');

    // Data Lists
    const [buildings, setBuildings] = useState<Option[]>([]);
    const [floors, setFloors] = useState<Option[]>([]);
    const [units, setUnits] = useState<Option[]>([]);
    const [users, setUsers] = useState<UserRow[]>([]);

    // --- 1. Initial Load: Fetch Buildings ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const response = await getBuildings();
                
                // ROBUST FIX FOR API DATA STRUCTURE
                // Case 1: Direct Array in response.data
                let userList = [];
                if (Array.isArray(response.data)) {
                    userList = response.data;
                    console.log("Response Data is a Direct Array. Using directly.");
                } 
                // Case 2: Object in response.data (Nested like { users: [...] })
                else if (typeof response.data === 'object' && response.data !== null) {
                    if (Array.isArray(response.data.users)) {
                        userList = response.data.users;
                        console.log("Response Data is an Object. Found users inside response.data.users");
                    } else if (Array.isArray(response.data.data)) {
                         // Fallback for flat object
                         userList = response.data;
                         console.log("Response Data is an Object. Mapping keys (flat object fallback)");
                    } else {
                        console.warn("Unknown response structure. Keys:", Object.keys(response.data || {}));
                    }
                }
                
                setBuildings(userList.length > 0 ? userList.map(b => ({ id: b.id, name: b.name })) : []);
            } catch (error) {
                console.error("Error fetching buildings:", error);
                setBuildings([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // --- 2. Fetch Floors when Building Changes ---
    useEffect(() => {
        if (!selectedBuilding) {
            setFloors([]);
            setUnits([]);
            setUsers([]); // Clear users if building changes
            return;
        }

        const fetchFloorsData = async () => {
            try {
                const response = await getFloors(selectedBuilding);
                let data = [];
                
                // ROBUST FIX FOR API DATA STRUCTURE
                if (Array.isArray(response.data)) {
                    data = response.data;
                    console.log("Floors: Array detected in response.data");
                } else if (typeof response.data === 'object' && response.data !== null) {
                    // Common nested structure
                    if (Array.isArray(response.data)) {
                         data = response.data;
                    } else if (response.data.floors) {
                         data = response.data.floors;
                    } else {
                         // Last resort: Try iterating the object keys
                         console.warn("No 'floors' or array found in object.");
                         const keys = Object.keys(response.data);
                         if (keys.length > 0) {
                             data = response.data[keys[0]]; // Just take the first key
                         } else {
                             data = [];
                         }
                    }
                }
                
                setFloors(data.length > 0 ? data.map(f => ({ id: f.id, name: f.name })) : []);
            } catch (error) {
                console.error("Error fetching floors:", error);
                setFloors([]); 
            }
        };

        fetchFloorsData();
    }, [selectedBuilding]);

    // --- 3. Fetch Units when Floor Changes ---
    useEffect(() => {
        if (!selectedFloor) {
            setUnits([]);
            setUsers([]);
            return;
        }

        const fetchUnitsData = async () => {
            try {
                const response = await getUnits(selectedFloor);
                let data = [];

                // ROBUST FIX FOR API DATA STRUCTURE
                if (Array.isArray(response.data)) {
                    data = response.data;
                    console.log("Units: Array detected in response.data");
                } else if (typeof response.data === 'object' && response.data !== null) {
                    if (Array.isArray(response.data.units)) {
                        data = response.data.units;
                    } else {
                        // Try to find an array inside
                        const keys = Object.keys(response.data);
                        for (const key of keys) {
                            if (Array.isArray(response.data[key])) {
                                data = response.data[key];
                                console.log(`Found array inside response.data.${key}`);
                                break;
                            }
                        }
                        if (data.length === 0) console.warn("No array found in object.");
                    }
                }

                setUnits(data.length > 0 ? data.map(u => ({ id: u.id, name: u.name })) : []);
            } catch (error) {
                console.error("Error fetching units:", error);
                setUnits([]); 
            }
        };

        fetchUnitsData();
    }, [selectedFloor]);

    // --- Helper for Badge Colors ---
    const getOwnershipBadge = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'owner':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'tenant':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'family':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // --- 4. Handle Search (Fetch Users) ---
    const handleSearch = async () => {
        setFetchingData(true);
        setUsers([]); // Clear previous results
        
        try {
            // Construct params
            const params: any = {};
            
            if (selectedBuilding) params.building_id = selectedBuilding;
            if (selectedFloor) params.floor_id = selectedFloor;
            if (selectedUnit) params.unit_id = selectedUnit;
            if (memberType) params.ownership = memberType;

            console.log("Fetching users with params:", params);

            // USE getSetupUsers API
            const response = await getSetupUsers(params);

            console.log("Raw API Response:", response);
            console.log("Response Data Type:", typeof response.data);
            console.log("Response Data Keys:", response.data ? Object.keys(response.data) : 'N/A');

            // SAFETY CHECK: Ensure we always have an array to map
            let userList: UserRow[] = [];
            
            // STRATEGY 1: Check if response.data is directly an Array
            if (Array.isArray(response.data)) {
                userList = response.data; // Direct assignment
                console.log("Response Data is a Direct Array. Using directly.");
            } 
            // STRATEGY 2: Check if response.data is an Object containing an array (e.g., { users: [...] })
            else if (typeof response.data === 'object' && response.data !== null) {
                // Try standard nested properties
                if (Array.isArray(response.data.users)) {
                    userList = response.data.users;
                    console.log("Response Data is an Object. Found users inside response.data.users");
                } else if (Array.isArray(response.data.data)) {
                     // Fallback: Iterate all keys to find an array
                    for (const key of Object.keys(response.data)) {
                        if (Array.isArray(response.data[key])) {
                            userList = response.data[key];
                            console.log(`Found array inside response.data.${key}`);
                            break;
                        }
                    }
                    if (userList.length === 0) console.warn("No array found in object.");
                }
            } else {
                console.warn("Unknown response structure.");
                userList = []; // Fallback
            }

            console.log("Final User List for mapping:", userList);

            // Map API response to UserRow interface
            // Adjust these keys (name, mobile, etc.) to match your actual backend response
            const mappedUsers = userList.map((item: any) => {
                // Check if item is an object, not an array element
                const userObj = item; // If items are objects, use them directly
                
                // If items are primitives (strings), handle differently (rare, but assuming objects based on your logs)
                // Assuming your user objects are simple strings or simple objects, we access properties safely
                // Use the name from the selected building/floor/unit lists for display
                const buildingName = buildings.find(b => b.id === selectedBuilding)?.name || '-';
                const floorName = floors.find(f => f.id === selectedFloor)?.name || '-';
                const unitName = units.find(u => u.id === selectedUnit)?.name || '-';
                
                return {
                    id: item.id,
                    name: userObj.name || userObj.first_name || '-', 
                    mobile: userObj.mobile || userObj.phone || '-', 
                    email: userObj.email || '-', 
                    building: buildingName,
                    floor: floorName,
                    unit: unitName,
                    ownership: userObj.ownership || memberType || 'Not Assigned',
                    units_count: 0,
                };
            });

            setUsers(mappedUsers);

        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to fetch users. Check console for details.");
        } finally {
            setFetchingData(false);
        }
    };

    // Handle Reset
    const handleReset = () => {
        setSelectedBuilding('');
        setSelectedFloor('');
        setSelectedUnit('');
        setMemberType('');
        setUsers([]);
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50 font-sans">
            {/* CARD CONTAINER */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-700" />
                            User Tree View
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage building occupants and ownership</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* FILTER SECTION */}
                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
                        
                        {/* Building Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Building</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                                    value={selectedBuilding}
                                    onChange={(e) => {
                                        setSelectedBuilding(e.target.value);
                                        setSelectedFloor(''); // Reset child
                                        setSelectedUnit('');
                                    }}
                                >
                                    <option value="">Select Building</option>
                                    {buildings.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Floor Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Floor</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                    value={selectedFloor}
                                    onChange={(e) => {
                                        setSelectedFloor(e.target.value);
                                        setSelectedUnit(''); // Reset child
                                        setUsers([]);
                                    }}
                                    disabled={!selectedBuilding}
                                >
                                    <option value="">Select Floor</option>
                                    {floors.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Unit Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Unit</label>
                            <div className="relative">
                                <DoorOpen className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                    value={selectedUnit}
                                    onChange={(e) => setSelectedUnit(e.target.value)}
                                    disabled={!selectedFloor}
                                >
                                    <option value="">Select Unit</option>
                                    {units.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Member Type Filter */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-default text-xs font-semibold uppercase text-gray-500 tracking-wider">Member Type</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                                    value={memberType}
                                    onChange={(e) => setMemberType(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="Owner">Owner</option>
                                    <option value="Tenant">Vendor</option>
                                    <option value="Family">Family</option>
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={fetchingData}
                            className="h-[38px] flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {fetchingData ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Search
                        </button>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="overflow-x-auto">
                    {fetchingData ? (
                        <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                           <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                           <span>Loading Users...</span>
                        </div>
                    ) : users.length > 0 ? (
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Actions</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Name</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Mobile</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Email</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Building</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Floor</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Ownership</th>
                                    <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-center">No. of Units</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((row) => (
                                    <tr 
                                        key={row.id} 
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => navigate(`/audit/vendor/scheduled/${row.id}`)}
                                                    className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Name */}
                                        <td className="px-6 py-4">{row.name}</td>

                                        {/* Mobile */}
                                        <td className="px-6 py-4 text-gray-600">{row.mobile}</td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-gray-600">{row.email}</td>

                                        {/* Building */}
                                        <td className="px-6 py-4 text-gray-700 font-medium">{row.building}</td>

                                        {/* Floor */}
                                        <td className="px-6 py-4 text-gray-600">{row.floor}</td>

                                        {/* Ownership */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getOwnershipBadge(row.ownership)}`}>
                                                {row.ownership}
                                            </span>
                                        </td>

                                        {/* Units Count */}
                                        <td className="px-6 py-4 text-center text-gray-600">{row.units_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                            <Users className="w-12 h-12 mb-3 opacity-50" />
                            <p className="font-medium">No users found</p>
                            <p className="text-sm mt-1">Select filters and click Search to view records.</p>
                        </div>
                    )}
                </div>

                {/* PAGINATION (Static for UI) */}
                {users.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                         <span className="text-sm text-gray-500">Showing 1 to {users.length} of {users.length} entries</span>
                         <div className="flex gap-1">
                           <button className="px-3 py-1.5 text-sm border rounded bg-white text-gray-500 disabled:opacity-50">Previous</button>
                           <button className="px-3 py-1.5 text-sm border rounded bg-slate-900 text-white font-medium">1</button>
                           <button className="px-3 py-1.5 text-sm border rounded bg-white text-gray-500 disabled:opacity-50">Next</button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTreePage;