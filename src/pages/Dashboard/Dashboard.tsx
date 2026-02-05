// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   Users, 
//   Wrench, 
//   Building2, 
//   CalendarDays, 
//   FileText, 
//   HardHat,
//   Ticket,
//   AlertTriangle,
//   Coffee,
//   TrendingUp,
//   TrendingDown,
//   ChevronRight,
//   Activity
// } from 'lucide-react';
// import { cn } from '@/lib/utils';

// interface SubModule {
//   name: string;
//   count: number;
//   path: string;
// }

// interface Module {
//   name: string;
//   icon: React.ElementType;
//   path: string;
//   color: string;
//   gradient: string;
//   growth: number;
//   totalCount: number;
//   subModules: SubModule[];
// }

// const modules: Module[] = [
//   { 
//     name: 'Service Desk', 
//     icon: Ticket, 
//     path: '/service-desk', 
//     color: 'bg-blue-500',
//     gradient: 'from-blue-500 to-blue-600',
//     growth: 12.5,
//     totalCount: 1247,
//     subModules: [
//       { name: 'Open Tickets', count: 156, path: '/service-desk?status=open' },
//       { name: 'In Progress', count: 89, path: '/service-desk?status=progress' },
//       { name: 'Resolved', count: 1002, path: '/service-desk?status=resolved' },
//     ]
//   },
//   { 
//     name: 'Asset', 
//     icon: Wrench, 
//     path: '/asset', 
//     color: 'bg-emerald-500',
//     gradient: 'from-emerald-500 to-emerald-600',
//     growth: 8.3,
//     totalCount: 3456,
//     subModules: [
//       { name: 'Assets', count: 2150, path: '/asset' },
//       { name: 'AMC', count: 234, path: '/asset/amc' },
//       { name: 'PPM', count: 567, path: '/asset/ppm-activity' },
//       { name: 'Stock Items', count: 505, path: '/asset/stock-items' },
//     ]
//   },
//   { 
//     name: 'Soft Services', 
//     icon: Building2, 
//     path: '/soft-services', 
//     color: 'bg-purple-500',
//     gradient: 'from-purple-500 to-purple-600',
//     growth: -2.1,
//     totalCount: 892,
//     subModules: [
//       { name: 'Services', count: 456, path: '/soft-services/service' },
//       { name: 'Checklists', count: 234, path: '/soft-services/checklist' },
//       { name: 'Tasks', count: 202, path: '/soft-services/task' },
//     ]
//   },
//   {
//     name: 'VMS',
//     icon: Users,
//     path: '/security/visitors',
//     color: 'bg-orange-500',
//     gradient: 'from-orange-500 to-orange-600',
//     growth: 15.7,
//     totalCount: 5623,
//     subModules: [
//       { name: 'Visitors', count: 3450, path: '/security/visitors' },
//       { name: 'Vehicles', count: 890, path: '/security/registered-vehicles' },
//       { name: 'Staff', count: 567, path: '/security/staff' },
//       { name: 'Patrolling', count: 456, path: '/security/patrolling' },
//       { name: 'Goods', count: 260, path: '/security/goods-in-out' },
//     ]
//   },
//   { 
//     name: 'Amenities Booking', 
//     icon: CalendarDays, 
//     path: '/amenities', 
//     color: 'bg-pink-500',
//     gradient: 'from-pink-500 to-pink-600',
//     growth: 5.2,
//     totalCount: 678,
//     subModules: [
//       { name: 'Active', count: 234, path: '/amenities?status=active' },
//       { name: 'Upcoming', count: 156, path: '/amenities?status=upcoming' },
//       { name: 'Completed', count: 288, path: '/amenities?status=completed' },
//     ]
//   },
//   { 
//     name: 'Space Booking', 
//     icon: Building2, 
//     path: '/space-booking', 
//     color: 'bg-indigo-500',
//     gradient: 'from-indigo-500 to-indigo-600',
//     growth: 9.8,
//     totalCount: 1234,
//     subModules: [
//       { name: 'Booked', count: 456, path: '/space-booking?status=booked' },
//       { name: 'Available', count: 345, path: '/space-booking?status=available' },
//       { name: 'Pending', count: 433, path: '/space-booking?status=pending' },
//     ]
//   },
//   { 
//     name: 'F&B', 
//     icon: Coffee, 
//     path: '/fb', 
//     color: 'bg-amber-500',
//     gradient: 'from-amber-500 to-amber-600',
//     growth: 18.4,
//     totalCount: 2345,
//     subModules: [
//       { name: 'Restaurant', count: 1234, path: '/fb/restaurant' },
//       { name: 'Pantry', count: 1111, path: '/fb/pantry' },
//     ]
//   },
//   { 
//     name: 'Incident', 
//     icon: AlertTriangle, 
//     path: '/incident', 
//     color: 'bg-red-500',
//     gradient: 'from-red-500 to-red-600',
//     growth: -5.6,
//     totalCount: 156,
//     subModules: [
//       { name: 'Open', count: 23, path: '/incident?status=open' },
//       { name: 'Investigating', count: 45, path: '/incident?status=investigating' },
//       { name: 'Resolved', count: 88, path: '/incident?status=resolved' },
//     ]
//   },
//   { 
//     name: 'Documents', 
//     icon: FileText, 
//     path: '/documents', 
//     color: 'bg-teal-500',
//     gradient: 'from-teal-500 to-teal-600',
//     growth: 3.2,
//     totalCount: 4567,
//     subModules: [
//       { name: 'Personal', count: 1234, path: '/documents/personal' },
//       { name: 'Common', count: 2345, path: '/documents/common' },
//       { name: 'Shared', count: 988, path: '/documents/shared' },
//     ]
//   },
//   { 
//     name: 'Fitout', 
//     icon: HardHat, 
//     path: '/fitout', 
//     color: 'bg-cyan-500',
//     gradient: 'from-cyan-500 to-cyan-600',
//     growth: 7.1,
//     totalCount: 234,
//     subModules: [
//       { name: 'Active', count: 89, path: '/fitout?status=active' },
//       { name: 'Completed', count: 123, path: '/fitout?status=completed' },
//       { name: 'Pending', count: 22, path: '/fitout?status=pending' },
//     ]
//   },
//   { 
//     name: 'Calendar', 
//     icon: CalendarDays, 
//     path: '/calendar', 
//     color: 'bg-violet-500',
//     gradient: 'from-violet-500 to-violet-600',
//     growth: 11.3,
//     totalCount: 789,
//     subModules: [
//       { name: 'Events', count: 345, path: '/calendar?type=events' },
//       { name: 'Tasks', count: 234, path: '/calendar?type=tasks' },
//       { name: 'Meetings', count: 210, path: '/calendar?type=meetings' },
//     ]
//   },
//   { 
//     name: 'Audit', 
//     icon: Activity, 
//     path: '/audit/operational/scheduled', 
//     color: 'bg-slate-500',
//     gradient: 'from-slate-500 to-slate-600',
//     growth: 6.8,
//     totalCount: 456,
//     subModules: [
//       { name: 'Operational', count: 234, path: '/audit/operational/scheduled' },
//       { name: 'Vendor', count: 222, path: '/audit/vendor/scheduled' },
//     ]
//   },
// ];

// const ModuleCard: React.FC<{ module: Module; index: number }> = ({ module, index }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const isPositiveGrowth = module.growth >= 0;

//   return (
//     <div
//       className={cn(
//         "bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 group",
//         isHovered && "shadow-card-hover border-primary/30 scale-[1.02]",
//         isExpanded && "row-span-2"
//       )}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       style={{ animationDelay: `${index * 50}ms` }}
//     >
//       {/* Header Section */}
//       <Link to={module.path} className="block p-5">
//         <div className="flex items-start justify-between mb-4">
//           <div className={cn(
//             "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
//             module.gradient
//           )}>
//             <module.icon className="w-6 h-6 text-white" />
//           </div>
          
//           {/* Growth Badge */}
//           <div className={cn(
//             "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
//             isPositiveGrowth 
//               ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
//               : "bg-red-500/10 text-red-600 dark:text-red-400"
//           )}>
//             {isPositiveGrowth ? (
//               <TrendingUp className="w-3 h-3" />
//             ) : (
//               <TrendingDown className="w-3 h-3" />
//             )}
//             <span>{Math.abs(module.growth)}%</span>
//           </div>
//         </div>

//         <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
//           {module.name}
//         </h3>
        
//         {/* Total Count */}
//         <div className="flex items-baseline gap-2">
//           <span className="text-2xl font-bold text-foreground">
//             {module.totalCount.toLocaleString()}
//           </span>
//           <span className="text-sm text-muted-foreground">total records</span>
//         </div>
//       </Link>

//       {/* Submodules Section */}
//       <div className="px-5 pb-4">
//         <button
//           onClick={(e) => {
//             e.preventDefault();
//             setIsExpanded(!isExpanded);
//           }}
//           className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
//         >
//           <span className="font-medium uppercase tracking-wider">Submodules ({module.subModules.length})</span>
//           <ChevronRight className={cn(
//             "w-4 h-4 transition-transform duration-200",
//             isExpanded && "rotate-90"
//           )} />
//         </button>

//         <div className={cn(
//           "space-y-2 overflow-hidden transition-all duration-300",
//           isExpanded ? "max-h-96 opacity-100" : "max-h-24 opacity-100"
//         )}>
//           {module.subModules.slice(0, isExpanded ? undefined : 3).map((subModule, idx) => (
//             <Link
//               key={subModule.name}
//               to={subModule.path}
//               className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group/sub"
//             >
//               <div className="flex items-center gap-2">
//                 <div className={cn(
//                   "w-2 h-2 rounded-full bg-gradient-to-r",
//                   module.gradient
//                 )} />
//                 <span className="text-sm text-muted-foreground group-hover/sub:text-foreground transition-colors">
//                   {subModule.name}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-semibold text-foreground">
//                   {subModule.count.toLocaleString()}
//                 </span>
//                 <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover/sub:opacity-100 transition-opacity" />
//               </div>
//             </Link>
//           ))}
          
//           {!isExpanded && module.subModules.length > 3 && (
//             <div className="text-xs text-muted-foreground text-center py-1">
//               +{module.subModules.length - 3} more
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="px-5 pb-4">
//         <div className="h-1.5 bg-muted rounded-full overflow-hidden">
//           <div 
//             className={cn(
//               "h-full rounded-full bg-gradient-to-r transition-all duration-500",
//               module.gradient
//             )}
//             style={{ 
//               width: isHovered ? '100%' : `${Math.min((module.totalCount / 5000) * 100, 100)}%` 
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const Dashboard: React.FC = () => {
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Simulate loading
//     const timer = setTimeout(() => setIsLoading(false), 500);
//     return () => clearTimeout(timer);
//   }, []);

//   // Calculate overall stats
//   const totalRecords = modules.reduce((acc, m) => acc + m.totalCount, 0);
//   const avgGrowth = modules.reduce((acc, m) => acc + m.growth, 0) / modules.length;

//   return (
//     <div className="p-6 min-h-screen">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
//         <p className="text-muted-foreground">Welcome to FM Module</p>
//       </div>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//         <div className="bg-card border border-border rounded-xl p-5">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//               <Activity className="w-5 h-5 text-primary" />
//             </div>
//             <span className="text-sm text-muted-foreground">Total Modules</span>
//           </div>
//           <p className="text-3xl font-bold text-foreground">{modules.length}</p>
//         </div>
        
//         <div className="bg-card border border-border rounded-xl p-5">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
//               <FileText className="w-5 h-5 text-emerald-500" />
//             </div>
//             <span className="text-sm text-muted-foreground">Total Records</span>
//           </div>
//           <p className="text-3xl font-bold text-foreground">{totalRecords.toLocaleString()}</p>
//         </div>
        
//         <div className="bg-card border border-border rounded-xl p-5">
//           <div className="flex items-center gap-3 mb-2">
//             <div className={cn(
//               "w-10 h-10 rounded-lg flex items-center justify-center",
//               avgGrowth >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
//             )}>
//               {avgGrowth >= 0 ? (
//                 <TrendingUp className="w-5 h-5 text-emerald-500" />
//               ) : (
//                 <TrendingDown className="w-5 h-5 text-red-500" />
//               )}
//             </div>
//             <span className="text-sm text-muted-foreground">Avg. Growth</span>
//           </div>
//           <p className={cn(
//             "text-3xl font-bold",
//             avgGrowth >= 0 ? "text-emerald-500" : "text-red-500"
//           )}>
//             {avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
//           </p>
//         </div>
//       </div>

//       {/* Module Cards Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {modules.map((module, index) => (
//           <ModuleCard key={module.name} module={module} index={index} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// import React, { useEffect, useRef, useState } from "react";
// import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import { getVibeCalendar } from "../../api";
// import {
//   getItemInLocalStorage,
//   setItemInLocalStorage,
// } from "../../utils/localStorage";
// import { getSiteData, siteChange } from "../../api";
// import { MdExpandLess, MdExpandMore } from "react-icons/md";
// import { FaBuilding } from "react-icons/fa";
// import { 
//   Activity, 
//   FileText, 
//   TrendingUp,
//   TrendingDown,
//   Wrench, 
//   Package, 
//   Sparkles,
//   Users,
//   Calendar as CalendarIcon,
//   Coffee,
//   AlertTriangle,
//   FileCheck,
//   Hammer,
//   ClipboardList,
//   Shield,
//   LucideIcon,
//   ChevronRight,
//   Ticket,
//   Building2,
//   HardHat
// } from 'lucide-react';

// // Type Definitions
// interface RootState {
//   theme: {
//     color: string;
//   };
// }

// interface SiteData {
//   id: number;
//   name_with_region: string;
// }

// interface SummaryCard {
//   title: string;
//   value: string;
//   icon: LucideIcon;
//   color: string;
// }

// interface SubModule {
//   name: string;
//   count: number;
//   path: string;
// }

// interface Module {
//   name: string;
//   icon: LucideIcon;
//   path: string;
//   total: number;
//   growth: number;
//   color: string;
//   gradient: string;
//   subModules: SubModule[];
//   progress: number;
// }

// interface PieDataItem {
//   name: string;
//   value: number;
// }

// interface BarDataItem {
//   name: string;
//   value: number;
// }

// interface ChartSlice {
//   path: string;
//   percentage: number;
//   color: string;
//   name: string;
// }

// interface ChartPoint {
//   x: number;
//   y: number;
//   growth: number;
//   name: string;
// }

// interface SimplePieChartProps {
//   data: PieDataItem[];
// }

// interface SimpleBarChartProps {
//   data: BarDataItem[];
// }

// interface SimpleLineChartProps {
//   modules: Module[];
// }

// interface ModuleCardProps {
//   module: Module;
//   index: number;
// }

// const Dashboard: React.FC = () => {
//   const themeColor = useSelector((state: RootState) => state.theme.color);
//   const vibeUserId = getItemInLocalStorage("VIBEUSERID") as string;
//   const [site, setSite] = useState<boolean>(false);
//   const [siteData, setSiteData] = useState<SiteData[]>([]);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const contentRef = useRef<HTMLElement>(null);

//   useEffect(() => {
//     const fetchCalendar = async (): Promise<void> => {
//       try {
//         const calendarResponse = await getVibeCalendar(vibeUserId);
//         console.log(calendarResponse);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     fetchCalendar();
//   }, [vibeUserId]);

//   useEffect(() => {
//     const fetchSiteData = async (): Promise<void> => {
//       try {
//         const response = await getSiteData();
//         setSiteData(response.data.sites);
//         console.log(response.data.sites);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchSiteData();
//   }, []);

//   const site_name = getItemInLocalStorage("SITENAME") as string;
  
//   const handleSiteChange = async (id: number, site: string): Promise<void> => {
//     try {
//       const response = await siteChange(id);
//       setItemInLocalStorage("SITEID", id);
//       setItemInLocalStorage("SITENAME", site);
//       window.location.reload();
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const toggleSite = (): void => {
//     setSite(!site);
//   };

//   const handleClickOutside = (event: MouseEvent): void => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//       setSite(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Module data with routing paths
//   const modules: Module[] = [
//     {
//       name: 'Service Desk',
//       icon: Ticket,
//       path: '/service-desk',
//       total: 1247,
//       growth: 12.5,
//       color: 'bg-blue-500',
//       gradient: 'from-blue-500 to-cyan-600',
//       subModules: [
//         { name: 'Open Tickets', count: 156, path: '/service-desk?status=open' },
//         { name: 'In Progress', count: 89, path: '/service-desk?status=progress' },
//         { name: 'Resolved', count: 1002, path: '/service-desk?status=resolved' },
//       ],
//       progress: 65
//     },
//     {
//       name: 'Asset',
//       icon: Package,
//       path: '/asset',
//       total: 3456,
//       growth: 8.3,
//       color: 'bg-emerald-500',
//       gradient: 'from-emerald-500 to-teal-600',
//       subModules: [
//         { name: 'Assets', count: 2150, path: '/asset' },
//         { name: 'AMC', count: 234, path: '/asset/amc' },
//         { name: 'PPM', count: 567, path: '/asset/ppm-activity' },
//         { name: 'Stock Items', count: 505, path: '/asset/stock-items' },
//       ],
//       progress: 78
//     },
//     {
//       name: 'Soft Services',
//       icon: Building2,
//       path: '/soft-services',
//       total: 892,
//       growth: -2.1,
//       color: 'bg-purple-500',
//       gradient: 'from-purple-500 to-pink-600',
//       subModules: [
//         { name: 'Services', count: 456, path: '/soft-services/service' },
//         { name: 'Checklists', count: 234, path: '/soft-services/checklist' },
//         { name: 'Tasks', count: 202, path: '/soft-services/task' },
//       ],
//       progress: 42
//     },
//     {
//       name: 'VMS',
//       icon: Users,
//       path: '/security/visitors',
//       total: 5623,
//       growth: 15.7,
//       color: 'bg-orange-500',
//       gradient: 'from-orange-500 to-amber-600',
//       subModules: [
//         { name: 'Visitors', count: 3450, path: '/security/visitors' },
//         { name: 'Vehicles', count: 890, path: '/security/registered-vehicles' },
//         { name: 'Staff', count: 567, path: '/security/staff' },
//         { name: 'Patrolling', count: 456, path: '/security/patrolling' },
//         { name: 'Goods', count: 260, path: '/security/goods-in-out' },
//       ],
//       progress: 88
//     },
//     {
//       name: 'Amenities Booking',
//       icon: CalendarIcon,
//       path: '/amenities',
//       total: 678,
//       growth: 5.2,
//       color: 'bg-pink-500',
//       gradient: 'from-pink-500 to-rose-600',
//       subModules: [
//         { name: 'Active', count: 234, path: '/amenities?status=active' },
//         { name: 'Upcoming', count: 156, path: '/amenities?status=upcoming' },
//         { name: 'Completed', count: 288, path: '/amenities?status=completed' },
//       ],
//       progress: 52
//     },
//     {
//       name: 'Space Booking',
//       icon: Building2,
//       path: '/space-booking',
//       total: 1234,
//       growth: 9.8,
//       color: 'bg-indigo-500',
//       gradient: 'from-indigo-500 to-blue-600',
//       subModules: [
//         { name: 'Booked', count: 456, path: '/space-booking?status=booked' },
//         { name: 'Available', count: 345, path: '/space-booking?status=available' },
//         { name: 'Pending', count: 433, path: '/space-booking?status=pending' },
//       ],
//       progress: 71
//     },
//     {
//       name: 'F&B',
//       icon: Coffee,
//       path: '/fb',
//       total: 2345,
//       growth: 18.4,
//       color: 'bg-amber-500',
//       gradient: 'from-amber-500 to-yellow-600',
//       subModules: [
//         { name: 'Restaurant', count: 1234, path: '/fb/restaurant' },
//         { name: 'Pantry', count: 1111, path: '/fb/pantry' },
//       ],
//       progress: 85
//     },
//     {
//       name: 'Incident',
//       icon: AlertTriangle,
//       path: '/incident',
//       total: 156,
//       growth: -5.6,
//       color: 'bg-red-500',
//       gradient: 'from-red-500 to-rose-600',
//       subModules: [
//         { name: 'Open', count: 23, path: '/incident?status=open' },
//         { name: 'Investigating', count: 45, path: '/incident?status=investigating' },
//         { name: 'Resolved', count: 88, path: '/incident?status=resolved' },
//       ],
//       progress: 35
//     },
//     {
//       name: 'Documents',
//       icon: FileCheck,
//       path: '/documents',
//       total: 4567,
//       growth: 3.2,
//       color: 'bg-teal-500',
//       gradient: 'from-teal-500 to-cyan-600',
//       subModules: [
//         { name: 'Personal', count: 1234, path: '/documents/personal' },
//         { name: 'Common', count: 2345, path: '/documents/common' },
//         { name: 'Shared', count: 988, path: '/documents/shared' },
//       ],
//       progress: 62
//     },
//     {
//       name: 'Fitout',
//       icon: HardHat,
//       path: '/fitout',
//       total: 234,
//       growth: 7.1,
//       color: 'bg-cyan-500',
//       gradient: 'from-cyan-500 to-teal-600',
//       subModules: [
//         { name: 'Active', count: 89, path: '/fitout?status=active' },
//         { name: 'Completed', count: 123, path: '/fitout?status=completed' },
//         { name: 'Pending', count: 22, path: '/fitout?status=pending' },
//       ],
//       progress: 58
//     },
//     {
//       name: 'Calendar',
//       icon: ClipboardList,
//       path: '/calendar',
//       total: 789,
//       growth: 11.3,
//       color: 'bg-violet-500',
//       gradient: 'from-violet-500 to-purple-600',
//       subModules: [
//         { name: 'Events', count: 345, path: '/calendar?type=events' },
//         { name: 'Tasks', count: 234, path: '/calendar?type=tasks' },
//         { name: 'Meetings', count: 210, path: '/calendar?type=meetings' },
//       ],
//       progress: 74
//     },
//     {
//       name: 'Audit',
//       icon: Shield,
//       path: '/audit/operational/scheduled',
//       total: 456,
//       growth: 6.8,
//       color: 'bg-slate-500',
//       gradient: 'from-slate-500 to-gray-600',
//       subModules: [
//         { name: 'Operational', count: 234, path: '/audit/operational/scheduled' },
//         { name: 'Vendor', count: 222, path: '/audit/vendor/scheduled' },
//       ],
//       progress: 68
//     },
//   ];

//   // Summary data
//   const totalRecords = modules.reduce((acc, m) => acc + m.total, 0);
//   const avgGrowth = modules.reduce((acc, m) => acc + m.growth, 0) / modules.length;

//   const summaryCards: SummaryCard[] = [
//     { title: 'Total Modules', value: '12', icon: Activity, color: 'from-violet-500 to-purple-600' },
//     { title: 'Total Records', value: totalRecords.toLocaleString(), icon: FileText, color: 'from-emerald-500 to-teal-600' },
//     { title: 'Avg. Growth', value: `${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`, icon: avgGrowth >= 0 ? TrendingUp : TrendingDown, color: avgGrowth >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600' },
//   ];

//   // Prepare chart data
//   const pieData: PieDataItem[] = [
//     { name: 'Service Desk', value: 1247 },
//     { name: 'Asset', value: 3456 },
//     { name: 'Soft Services', value: 892 },
//     { name: 'VMS', value: 5623 },
//     { name: 'F&B', value: 2345 },
//     { name: 'Documents', value: 4567 },
//   ];

//   const barData: BarDataItem[] = modules.map(m => ({ name: m.name, value: m.total }));

//   return (
//     <section className="flex w-full" ref={contentRef}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        
//         * {
//           font-family: 'DM Sans', sans-serif;
//         }
        
//         h1, h2, h3 {
//           font-family: 'Playfair Display', serif;
//         }
        
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes slideInRight {
//           from {
//             opacity: 0;
//             transform: translateX(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }
        
//         @keyframes scaleIn {
//           from {
//             opacity: 0;
//             transform: scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
        
//         .animate-fadeInUp {
//           animation: fadeInUp 0.6s ease-out forwards;
//         }
        
//         .animate-slideInRight {
//           animation: slideInRight 0.6s ease-out forwards;
//         }
        
//         .animate-scaleIn {
//           animation: scaleIn 0.5s ease-out forwards;
//         }
        
//         .card-hover {
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }
        
//         .card-hover:hover {
//           transform: translateY(-4px);
//           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
//         }
        
//         .progress-bar {
//           transition: width 1s ease-out;
//         }
//       `}</style>

//       <div className="w-full flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
//         {/* Header with Site Selector */}
//         <header
//           style={{ background: themeColor }}
//           className="w-full h-12 rounded-md my-1 flex justify-between items-center px-6"
//         >
//           <nav>
//             <h1 className="text-white text-xl font-semibold">
//               Vibe Connect
//             </h1>
//           </nav>

//           <div className="relative" ref={dropdownRef}>
//             <div
//               onClick={toggleSite}
//               className="cursor-pointer flex items-center gap-2 font-medium p-2 text-white"
//             >
//               <FaBuilding />
//               <h2>{site_name}</h2>
//               <div className="">
//                 {site
//                   ? React.createElement(MdExpandLess, { size: "30" })
//                   : React.createElement(MdExpandMore, { size: "30" })}
//               </div>
//             </div>
//             {site && (
//               <div className="absolute right-0 bg-white border-2 rounded shadow-md max-h-80 w-80 overflow-y-auto z-10 px-5 space-y-2 py-2">
//                 {siteData.map((site, index) => (
//                   <button
//                     key={site.id}
//                     onClick={() => {
//                       handleSiteChange(site.id, site.name_with_region);
//                     }}
//                     className="hover:text-gray-500"
//                   >
//                     {site.name_with_region}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </header>

//         {/* Main Dashboard Content */}
//         <div className="w-full px-6 py-4">
//           {/* Page Title */}
//           <div className="mb-8 animate-fadeInUp">
//             <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
//             <p className="text-lg text-gray-600 font-medium">Welcome to FM Module</p>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//             {summaryCards.map((card, index) => {
//               const Icon = card.icon;
//               return (
//                 <div 
//                   key={index} 
//                   className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover animate-scaleIn"
//                   style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{card.title}</p>
//                       <p className="text-4xl font-bold text-gray-900">{card.value}</p>
//                     </div>
//                     <div className={`bg-gradient-to-br ${card.color} p-3 rounded-xl shadow-lg`}>
//                       <Icon className="w-7 h-7 text-white" />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Module Cards Grid */}
//           <div className="mb-12">
//             <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Modules Overview</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {modules.map((module, index) => (
//                 <ModuleCard key={module.name} module={module} index={index} />
//               ))}
//             </div>
//           </div>

//           {/* Charts Section */}
//           <div className="space-y-8 mb-10">
//             <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics & Insights</h2>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Pie Chart */}
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0 }}>
//                 <h3 className="text-xl font-bold text-gray-900 mb-6">Overall Module Distribution</h3>
//                 <SimplePieChart data={pieData} />
//               </div>

//               {/* Bar Chart */}
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
//                 <h3 className="text-xl font-bold text-gray-900 mb-6">Module-wise Records</h3>
//                 <SimpleBarChart data={barData} />
//               </div>
//             </div>

//             {/* Line Chart - Full Width */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{ animationDelay: '0.4s', opacity: 0 }}>
//               <h3 className="text-xl font-bold text-gray-900 mb-6">Growth Trend</h3>
//               <SimpleLineChart modules={modules} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// // Module Card Component
// const ModuleCard: React.FC<ModuleCardProps> = ({ module, index }) => {
//   const [isHovered, setIsHovered] = useState<boolean>(false);
//   const [isExpanded, setIsExpanded] = useState<boolean>(false);
//   const isPositiveGrowth = module.growth >= 0;

//   return (
//     <div
//       className={`bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 group card-hover animate-slideInRight ${
//         isHovered ? 'border-blue-300' : ''
//       }`}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
//     >
//       {/* Header Section */}
//       <Link to={module.path} className="block p-5">
//         <div className="flex items-start justify-between mb-4">
//           <div className={`bg-gradient-to-br ${module.gradient} p-3 rounded-xl shadow-md`}>
//             <module.icon className="w-6 h-6 text-white" />
//           </div>
          
//           {/* Growth Badge */}
//           <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
//             isPositiveGrowth 
//               ? 'bg-green-100 text-green-700' 
//               : 'bg-red-100 text-red-700'
//           }`}>
//             {isPositiveGrowth ? (
//               <TrendingUp className="w-3 h-3" />
//             ) : (
//               <TrendingDown className="w-3 h-3" />
//             )}
//             <span>{module.growth > 0 ? '+' : ''}{module.growth}%</span>
//           </div>
//         </div>

//         <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
//           {module.name}
//         </h3>
        
//         {/* Total Count */}
//         <div className="flex items-baseline gap-2">
//           <span className="text-3xl font-bold text-gray-800">
//             {module.total.toLocaleString()}
//           </span>
//           <span className="text-sm text-gray-500">records</span>
//         </div>
//       </Link>

//       {/* Submodules Section */}
//       <div className="px-5 pb-4">
//         <button
//           onClick={(e) => {
//             e.preventDefault();
//             setIsExpanded(!isExpanded);
//           }}
//           className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-700 transition-colors mb-2"
//         >
//           <span className="font-semibold uppercase tracking-wider">Submodules ({module.subModules.length})</span>
//           <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
//             isExpanded ? 'rotate-90' : ''
//           }`} />
//         </button>

//         <div className={`space-y-2 overflow-hidden transition-all duration-300 ${
//           isExpanded ? 'max-h-96 opacity-100' : 'max-h-24 opacity-100'
//         }`}>
//           {module.subModules.slice(0, isExpanded ? undefined : 3).map((subModule, idx) => (
//             <Link
//               key={subModule.name}
//               to={subModule.path}
//               className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group/sub"
//             >
//               <div className="flex items-center gap-2">
//                 <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${module.gradient}`} />
//                 <span className="text-sm text-gray-600 group-hover/sub:text-gray-900 transition-colors">
//                   {subModule.name}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-bold text-gray-900">
//                   {subModule.count.toLocaleString()}
//                 </span>
//                 <ChevronRight className="w-3 h-3 text-gray-400 opacity-0 group-hover/sub:opacity-100 transition-opacity" />
//               </div>
//             </Link>
//           ))}
          
//           {!isExpanded && module.subModules.length > 3 && (
//             <div className="text-xs text-gray-500 text-center py-1">
//               +{module.subModules.length - 3} more
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="px-5 pb-4">
//         <div className="flex justify-between items-center mb-2">
//           <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</span>
//           <span className="text-xs font-bold text-gray-700">{module.progress}%</span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//           <div 
//             className={`h-full bg-gradient-to-r ${module.gradient} progress-bar rounded-full`}
//             style={{ width: `${module.progress}%` }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// // Simple Pie Chart Component
// const SimplePieChart: React.FC<SimplePieChartProps> = ({ data }) => {
//   const getGradientColors = (color?: string) => {
//   if (!color || typeof color !== "string") {
//     return {
//       from: "text-blue-500",
//       to: "text-blue-700",
//     };
//   }

//   const parts = color.split(" ");

//   return {
//     from: parts[0]?.replace("from-", "text-") || "text-blue-500",
//     to: parts[2]?.replace("to-", "text-blue-700") || "text-blue-700",
//   };
// };

//   const total = data.reduce((sum, item) => sum + item.value, 0);
//   const colors: string[] = [
//     'from-blue-500 to-cyan-600',
//     'from-emerald-500 to-teal-600',
//     'from-purple-500 to-pink-600',
//     'from-orange-500 to-amber-600',
//     'from-amber-500 to-yellow-600',
//     'from-teal-500 to-cyan-600',
//   ];

//   let currentAngle = 0;
//   const radius = 100;
//   const centerX = 120;
//   const centerY = 120;

//   const slices: ChartSlice[] = data.map((item, index) => {
//     const percentage = (item.value / total) * 100;
//     const angle = (percentage / 100) * 360;
//     const startAngle = currentAngle;
//     const endAngle = currentAngle + angle;
    
//     const x1 = centerX + radius * Math.cos((Math.PI * startAngle) / 180);
//     const y1 = centerY + radius * Math.sin((Math.PI * startAngle) / 180);
//     const x2 = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
//     const y2 = centerY + radius * Math.sin((Math.PI * endAngle) / 180);
    
//     const largeArc = angle > 180 ? 1 : 0;
    
//     const path = [
//       `M ${centerX} ${centerY}`,
//       `L ${x1} ${y1}`,
//       `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
//       'Z'
//     ].join(' ');
    
//     currentAngle = endAngle;
    
//     return { path, percentage, color: colors[index % colors.length], name: item.name };
//   });

//   return (
//     <div className="flex flex-col items-center">
//       {/* <svg width="240" height="240" className="mb-6">
//         {slices.map((slice, index) => (
//           <g key={index}>
//             <defs>
//               <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" className={`${slice.color.split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" />
//                 <stop offset="100%" className={`${slice.color.split(' ')[2].replace('to-', 'text-')}`} stopColor="currentColor" />
//               </linearGradient>
//             </defs>
//             <path
//               d={slice.path}
//               fill={`url(#gradient-${index})`}
//               className="transition-all duration-300 hover:opacity-80 cursor-pointer"
//               style={{ transformOrigin: `${centerX}px ${centerY}px` }}
//             />
//           </g>
//         ))}
//       </svg> */}
//       <svg width="240" height="240" className="mb-6">
//   {slices.map((slice, index) => {
//     const { from, to } = getGradientColors(slice?.color);

//     if (!slice?.path) return null; // extra safety

//     return (
//       <g key={index}>
//         <defs>
//           <linearGradient
//             id={`gradient-${index}`}
//             x1="0%"
//             y1="0%"
//             x2="100%"
//             y2="100%"
//           >
//             <stop offset="0%" className={from} stopColor="currentColor" />
//             <stop offset="100%" className={to} stopColor="currentColor" />
//           </linearGradient>
//         </defs>

//         <path
//           d={slice.path}
//           fill={`url(#gradient-${index})`}
//           className="transition-all duration-300 hover:opacity-80 cursor-pointer"
//           style={{ transformOrigin: `${centerX}px ${centerY}px` }}
//         />
//       </g>
//     );
//   })}
// </svg>

      
//       <div className="grid grid-cols-2 gap-3 w-full">
//         {slices.map((slice, index) => (
//           <div key={index} className="flex items-center gap-2">
//             <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${slice.color}`}></div>
//             <div className="flex-1">
//               <p className="text-xs font-semibold text-gray-700">{slice.name}</p>
//               <p className="text-xs text-gray-500">{slice.percentage.toFixed(1)}%</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Simple Bar Chart Component
// const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
//   const maxValue = Math.max(...data.map(d => d.value));
//   const colors: string[] = [
//     'from-blue-500 to-cyan-600',
//     'from-emerald-500 to-teal-600',
//     'from-purple-500 to-pink-600',
//     'from-orange-500 to-amber-600',
//     'from-pink-500 to-rose-600',
//     'from-indigo-500 to-blue-600',
//     'from-amber-500 to-yellow-600',
//     'from-red-500 to-rose-600',
//     'from-teal-500 to-cyan-600',
//     'from-cyan-500 to-teal-600',
//     'from-violet-500 to-purple-600',
//     'from-slate-500 to-gray-600',
//   ];

//   return (
//     <div className="space-y-3">
//       {data.map((item, index) => {
//         const percentage = (item.value / maxValue) * 100;
//         return (
//           <div key={index}>
//             <div className="flex justify-between items-center mb-1">
//               <span className="text-xs font-semibold text-gray-700">{item.name}</span>
//               <span className="text-xs font-bold text-gray-900">{item.value.toLocaleString()}</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//               <div
//                 className={`h-full bg-gradient-to-r ${colors[index % colors.length]} progress-bar rounded-full`}
//                 style={{ width: `${percentage}%` }}
//               ></div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// // Simple Line Chart Component
// const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ modules }) => {
//   const maxGrowth = Math.max(...modules.map(m => Math.abs(m.growth)));
//   const chartHeight = 200;
//   const chartWidth = 100;
  
//   const points: ChartPoint[] = modules.map((module, index) => {
//     const x = (index / (modules.length - 1)) * chartWidth;
//     const normalizedGrowth = ((module.growth + maxGrowth) / (2 * maxGrowth)) * chartHeight;
//     const y = chartHeight - normalizedGrowth;
//     return { x, y, growth: module.growth, name: module.name };
//   });

//   const pathData = points.map((point, index) => 
//     `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
//   ).join(' ');

//   return (
//     <div className="relative">
//       <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} preserveAspectRatio="none" className="w-full">
//         {/* Zero line */}
//         <line
//           x1="0"
//           y1={chartHeight / 2}
//           x2={chartWidth}
//           y2={chartHeight / 2}
//           stroke="#e5e7eb"
//           strokeWidth="1"
//           strokeDasharray="4 4"
//         />
        
//         {/* Gradient for area under curve */}
//         <defs>
//           <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
//             <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
//           </linearGradient>
//         </defs>
        
//         {/* Area under curve */}
//         <path
//           d={`${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
//           fill="url(#lineGradient)"
//         />
        
//         {/* Line */}
//         <path
//           d={pathData}
//           fill="none"
//           stroke="#10b981"
//           strokeWidth="2"
//           className="transition-all duration-500"
//         />
        
//         {/* Points */}
//         {points.map((point, index) => (
//           <g key={index}>
//             <circle
//               cx={point.x}
//               cy={point.y}
//               r="3"
//               fill="#10b981"
//               className="transition-all duration-300 hover:r-5"
//             />
//           </g>
//         ))}
//       </svg>
      
//       {/* Legend */}
//       <div className="flex flex-wrap gap-2 mt-4 justify-center">
//         {points.map((point, index) => (
//           <div key={index} className="flex items-center gap-1 text-xs">
//             <div className="w-2 h-2 rounded-full bg-green-500"></div>
//             <span className="text-gray-600 font-medium">{point.name}:</span>
//             <span className={`font-bold ${point.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
//               {point.growth > 0 ? '+' : ''}{point.growth}%
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getVibeCalendar, getSiteData, siteChange } from "../../api";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "../../utils/localStorage";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { FaBuilding } from "react-icons/fa";
import { 
  Activity, 
  FileText, 
  TrendingUp, 
  Wrench, 
  Package, 
  Sparkles,
  Users,
  Calendar as CalendarIcon,
  Coffee,
  AlertTriangle,
  FileCheck,
  Hammer,
  ClipboardList,
  Shield,
  Loader2,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

// API endpoints - Add these to your api.js file
// export const getDashboardStats = () => api.get('/dashboard/stats');
// export const getModuleData = () => api.get('/dashboard/modules');

interface DashboardStats {
  totalModules: number;
  totalRecords: number;
  avgGrowth: number;
}

interface Submodule {
  name: string;
  count: number;
}

interface Module {
  id: number;
  name: string;
  icon: string;
  total: number;
  growth: number;
  color: string;
  submodules: Submodule[];
  progress: number;
}

const Dashboard = () => {
  const themeColor = useSelector((state: any) => state.theme.color);
  const vibeUserId = getItemInLocalStorage("VIBEUSERID");
  const [site, setSite] = useState(false);
  const [siteData, setSiteData] = useState([]);
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  // Loading and data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalModules: 0,
    totalRecords: 0,
    avgGrowth: 0,
  });
  const [modules, setModules] = useState<Module[]>([]);

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    Wrench,
    Package,
    Sparkles,
    Users,
    CalendarIcon,
    Coffee,
    AlertTriangle,
    FileCheck,
    Hammer,
    ClipboardList,
    Shield,
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCalendar(),
        fetchSiteData(),
        fetchDashboardData(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      const calendarResponse = await getVibeCalendar(vibeUserId);
      console.log(calendarResponse);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSiteData = async () => {
    try {
      const response = await getSiteData();
      setSiteData(response.data.sites);
    } catch (error) {
      console.error("Error fetching site data:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API call
      // const statsResponse = await getDashboardStats();
      // const modulesResponse = await getModuleData();
      
      // For now, using mock data - replace this with actual API response
      const mockStats = {
        totalModules: 12,
        totalRecords: 21677,
        avgGrowth: 7.5,
      };

      const mockModules = [
        {
          id: 1,
          name: 'Service Desk',
          icon: 'Wrench',
          total: 1247,
          growth: 12.5,
          color: 'from-blue-500 to-cyan-600',
          submodules: [
            { name: 'Open Tickets', count: 156 },
            { name: 'In Progress', count: 89 },
            { name: 'Closed', count: 1002 },
          ],
          progress: 65
        },
        {
          id: 2,
          name: 'Asset',
          icon: 'Package',
          total: 3456,
          growth: 8.3,
          color: 'from-purple-500 to-pink-600',
          submodules: [
            { name: 'Total Assets', count: 2150 },
            { name: 'Active AMC', count: 234 },
            { name: 'Pending', count: 1072 },
          ],
          progress: 78
        },
        {
          id: 3,
          name: 'Soft Services',
          icon: 'Sparkles',
          total: 892,
          growth: -2.1,
          color: 'from-amber-500 to-orange-600',
          submodules: [
            { name: 'Active Services', count: 456 },
            { name: 'Checklists', count: 234 },
            { name: 'Completed', count: 202 },
          ],
          progress: 42
        },
        {
          id: 4,
          name: 'VMS',
          icon: 'Users',
          total: 5623,
          growth: 15.7,
          color: 'from-indigo-500 to-blue-600',
          submodules: [
            { name: 'Today Visitors', count: 234 },
            { name: 'Total Visitors', count: 3450 },
            { name: 'Vehicles', count: 890 },
          ],
          progress: 88
        },
        {
          id: 5,
          name: 'Amenities Booking',
          icon: 'CalendarIcon',
          total: 678,
          growth: 5.2,
          color: 'from-rose-500 to-red-600',
          submodules: [
            { name: 'Active Bookings', count: 234 },
            { name: 'Upcoming', count: 156 },
            { name: 'Completed', count: 288 },
          ],
          progress: 52
        },
        {
          id: 6,
          name: 'Space Booking',
          icon: 'CalendarIcon',
          total: 1234,
          growth: 9.8,
          color: 'from-teal-500 to-cyan-600',
          submodules: [
            { name: 'Booked Today', count: 45 },
            { name: 'Total Booked', count: 456 },
            { name: 'Available', count: 345 },
          ],
          progress: 71
        },
        {
          id: 7,
          name: 'F&B',
          icon: 'Coffee',
          total: 2345,
          growth: 18.4,
          color: 'from-yellow-500 to-amber-600',
          submodules: [
            { name: 'Restaurant Orders', count: 1234 },
            { name: 'Pantry Orders', count: 1111 },
          ],
          progress: 85
        },
        {
          id: 8,
          name: 'Incident',
          icon: 'AlertTriangle',
          total: 156,
          growth: -5.6,
          color: 'from-red-500 to-rose-600',
          submodules: [
            { name: 'Critical', count: 12 },
            { name: 'Open', count: 23 },
            { name: 'Investigating', count: 45 },
            { name: 'Resolved', count: 76 },
          ],
          progress: 35
        },
        {
          id: 9,
          name: 'Documents',
          icon: 'FileCheck',
          total: 4567,
          growth: 3.2,
          color: 'from-slate-500 to-gray-600',
          submodules: [
            { name: 'Personal Docs', count: 1234 },
            { name: 'Common Docs', count: 2345 },
            { name: 'Archived', count: 988 },
          ],
          progress: 62
        },
        {
          id: 10,
          name: 'Fitout',
          icon: 'Hammer',
          total: 234,
          growth: 7.1,
          color: 'from-orange-500 to-red-600',
          submodules: [
            { name: 'Active Projects', count: 89 },
            { name: 'Completed', count: 123 },
            { name: 'Pending', count: 22 },
          ],
          progress: 58
        },
        {
          id: 11,
          name: 'Calendar',
          icon: 'ClipboardList',
          total: 789,
          growth: 11.3,
          color: 'from-green-500 to-teal-600',
          submodules: [
            { name: 'Upcoming Events', count: 45 },
            { name: 'Total Events', count: 345 },
            { name: 'Tasks', count: 234 },
          ],
          progress: 74
        },
        {
          id: 12,
          name: 'Audit',
          icon: 'Shield',
          total: 456,
          growth: 6.8,
          color: 'from-violet-500 to-indigo-600',
          submodules: [
            { name: 'Operational Audits', count: 234 },
            { name: 'Vendor Audits', count: 222 },
          ],
          progress: 68
        },
      ];

      setDashboardStats(mockStats);
      setModules(mockModules);

      /* 
      // Uncomment when API is ready:
      setDashboardStats({
        totalModules: statsResponse.data.total_modules,
        totalRecords: statsResponse.data.total_records,
        avgGrowth: statsResponse.data.avg_growth,
      });
      setModules(modulesResponse.data.modules);
      */
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
      toast.success("Dashboard refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  const site_name = getItemInLocalStorage("SITENAME");
  
  const handleSiteChange = async (id: number, site: string) => {
    try {
      const response = await siteChange(id);
      setItemInLocalStorage("SITEID", id);
      setItemInLocalStorage("SITENAME", site);
      window.location.reload();
    } catch (error) {
      console.error("Error changing site:", error);
      toast.error("Failed to change site");
    }
  };

  const toggleSite = () => {
    setSite(!site);
  };

  const handleClickOutside = (event: any) => {
    if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
      setSite(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Summary cards data
  const summaryCards = [
    { 
      title: 'Total Modules', 
      value: dashboardStats.totalModules.toString(), 
      icon: Activity, 
      color: 'from-violet-500 to-purple-600',
      description: 'Active modules'
    },
    { 
      title: 'Total Records', 
      value: dashboardStats.totalRecords.toLocaleString(), 
      icon: FileText, 
      color: 'from-emerald-500 to-teal-600',
      description: 'Across all modules'
    },
    { 
      title: 'Avg. Growth', 
      value: `${dashboardStats.avgGrowth > 0 ? '+' : ''}${dashboardStats.avgGrowth}%`, 
      icon: TrendingUp, 
      color: 'from-green-500 to-emerald-600',
      description: 'Month over month'
    },
  ];

  // Prepare chart data
  const pieData = modules
    .slice(0, 6)
    .map(m => ({ name: m.name, value: m.total }));

  const barData = modules.map(m => ({ name: m.name, value: m.total }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex w-full" ref={contentRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'DM Sans', sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Playfair Display', serif;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .progress-bar {
          transition: width 1s ease-out;
        }
      `}</style>

      <div className="w-full flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
        {/* Header with Site Selector */}
        <header
          style={{ background: themeColor }}
          className="w-full h-12 rounded-md my-1 flex justify-between items-center px-6"
        >
          <nav>
            <h1 className="text-white text-xl font-semibold">
              Vibe Connect
            </h1>
          </nav>

          <div className="flex items-center gap-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Site Selector */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={toggleSite}
                className="cursor-pointer flex items-center gap-2 font-medium p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaBuilding />
                <h2>{site_name}</h2>
                <div className="">
                  {site
                    ? React.createElement(MdExpandLess, { size: "30" })
                    : React.createElement(MdExpandMore, { size: "30" })}
                </div>
              </div>
              {site && (
                <div className="absolute right-0 bg-white border-2 rounded-lg shadow-xl max-h-80 w-80 overflow-y-auto z-10 py-2 mt-2">
                  {siteData.map((siteItem: any) => (
                    <button
                      key={siteItem.id}
                      onClick={() => {
                        handleSiteChange(siteItem.id, siteItem.name_with_region);
                      }}
                      className="w-full text-left px-5 py-2 hover:bg-gray-100 transition-colors"
                    >
                      {siteItem.name_with_region}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="w-full px-6 py-4">
          {/* Page Title */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
            <p className="text-lg text-gray-600 font-medium">Welcome to FM Module - Real-time Overview</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{card.title}</p>
                      <p className="text-4xl font-bold text-gray-900 mb-1">{card.value}</p>
                      <p className="text-xs text-gray-500">{card.description}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${card.color} p-3 rounded-xl shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Module Cards Grid */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Modules Overview</h2>
              <p className="text-sm text-gray-500">{modules.length} modules active</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.map((module, index) => {
                const Icon = iconMap[module.icon] || Activity;
                return (
                  <div 
                    key={module.id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover animate-slideInRight"
                    style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                  >
                    {/* Icon and Growth Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`bg-gradient-to-br ${module.color} p-3 rounded-xl shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        module.growth > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {module.growth > 0 ? '+' : ''}{module.growth}%
                      </span>
                    </div>

                    {/* Module Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{module.name}</h3>
                    <p className="text-3xl font-bold text-gray-800 mb-4">{module.total.toLocaleString()}</p>

                    {/* Submodules */}
                    <div className="space-y-2 mb-4">
                      {module.submodules.map((sub, subIndex) => (
                        <div key={subIndex} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">{sub.name}</span>
                          <span className="text-gray-900 font-bold">{sub.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completion</span>
                        <span className="text-xs font-bold text-gray-700">{module.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${module.color} progress-bar rounded-full`}
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts Section */}
          <div className="space-y-8 mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics & Insights</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Top 6 Module Distribution</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {pieData.reduce((sum, item) => sum + item.value, 0).toLocaleString()} Total
                  </span>
                </div>
                <ImprovedPieChart data={pieData} />
              </div>

              {/* Records Comparison */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Module-wise Records</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {modules.length} Modules
                  </span>
                </div>
                <ImprovedBarChart data={barData} />
              </div>
            </div>

            {/* Growth Trend - Full Width */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{ animationDelay: '0.4s', opacity: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Growth Trend Analysis</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">Positive Growth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600">Negative Growth</span>
                  </div>
                </div>
              </div>
              <ImprovedLineChart modules={modules} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Improved Pie Chart Component with better readability
const ImprovedPieChart = ({ data }: { data: Array<{ name: string; value: number }> }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    { from: '#3b82f6', to: '#06b6d4' }, // blue to cyan
    { from: '#a855f7', to: '#ec4899' }, // purple to pink
    { from: '#f59e0b', to: '#f97316' }, // amber to orange
    { from: '#6366f1', to: '#3b82f6' }, // indigo to blue
    { from: '#eab308', to: '#f59e0b' }, // yellow to amber
    { from: '#64748b', to: '#6b7280' }, // slate to gray
  ];

  const chartData = data.map((item, index) => ({
    ...item,
    percentage: (item.value / total) * 100,
    color: colors[index % colors.length]
  }));

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Donut Chart */}
      <div className="relative flex-shrink-0">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <defs>
            {chartData.map((item, index) => (
              <linearGradient key={index} id={`pie-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={item.color.from} />
                <stop offset="100%" stopColor={item.color.to} />
              </linearGradient>
            ))}
          </defs>
          {(() => {
            let currentAngle = -90;
            return chartData.map((item, index) => {
              const angle = (item.percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              
              const outerRadius = 90;
              const innerRadius = 55;
              
              const x1 = 100 + outerRadius * Math.cos(startRad);
              const y1 = 100 + outerRadius * Math.sin(startRad);
              const x2 = 100 + outerRadius * Math.cos(endRad);
              const y2 = 100 + outerRadius * Math.sin(endRad);
              
              const x3 = 100 + innerRadius * Math.cos(endRad);
              const y3 = 100 + innerRadius * Math.sin(endRad);
              const x4 = 100 + innerRadius * Math.cos(startRad);
              const y4 = 100 + innerRadius * Math.sin(startRad);
              
              const largeArc = angle > 180 ? 1 : 0;
              
              const path = [
                `M ${x1} ${y1}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                'Z'
              ].join(' ');
              
              currentAngle = endAngle;
              
              return (
                <path
                  key={index}
                  d={path}
                  fill={`url(#pie-gradient-${index})`}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              );
            });
          })()}
          
          {/* Center text */}
          <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold fill-gray-900">
            {total.toLocaleString()}
          </text>
          <text x="100" y="110" textAnchor="middle" className="text-xs fill-gray-500">
            Total Records
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex-1 space-y-2 w-full">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ 
                  background: `linear-gradient(135deg, ${item.color.from}, ${item.color.to})` 
                }}
              ></div>
              <span className="text-sm font-semibold text-gray-700">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Improved Bar Chart Component
const ImprovedBarChart = ({ data }: { data: Array<{ name: string; value: number }> }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = [
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-indigo-500 to-blue-600',
    'from-rose-500 to-red-600',
    'from-teal-500 to-cyan-600',
    'from-yellow-500 to-amber-600',
    'from-red-500 to-rose-600',
    'from-slate-500 to-gray-600',
    'from-orange-500 to-red-600',
    'from-green-500 to-teal-600',
    'from-violet-500 to-indigo-600',
  ];

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={index} className="group">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                {item.name}
              </span>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}</span>
                <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colors[index % colors.length]} progress-bar rounded-full relative group-hover:shadow-lg transition-all`}
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Improved Line Chart Component
const ImprovedLineChart = ({ modules }: { modules: Module[] }) => {
  const positiveGrowth = modules.filter(m => m.growth > 0);
  const negativeGrowth = modules.filter(m => m.growth < 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-xs font-semibold text-green-700 uppercase mb-1">Positive Growth</p>
          <p className="text-2xl font-bold text-green-900">{positiveGrowth.length}</p>
          <p className="text-xs text-green-600 mt-1">modules growing</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-xs font-semibold text-red-700 uppercase mb-1">Negative Growth</p>
          <p className="text-2xl font-bold text-red-900">{negativeGrowth.length}</p>
          <p className="text-xs text-red-600 mt-1">modules declining</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Highest Growth</p>
          <p className="text-2xl font-bold text-blue-900">
            +{Math.max(...modules.map(m => m.growth)).toFixed(1)}%
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {modules.find(m => m.growth === Math.max(...modules.map(m => m.growth)))?.name}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 uppercase mb-1">Avg Growth</p>
          <p className="text-2xl font-bold text-purple-900">
            +{(modules.reduce((sum, m) => sum + m.growth, 0) / modules.length).toFixed(1)}%
          </p>
          <p className="text-xs text-purple-600 mt-1">across all modules</p>
        </div>
      </div>

      {/* Module Growth Bars */}
      <div className="space-y-3">
        {modules
          .sort((a, b) => b.growth - a.growth)
          .map((module, index) => {
            const maxAbsGrowth = Math.max(...modules.map(m => Math.abs(m.growth)));
            const barWidth = (Math.abs(module.growth) / maxAbsGrowth) * 100;
            
            return (
              <div key={module.id} className="flex items-center gap-4">
                <div className="w-32 text-right">
                  <p className="text-sm font-semibold text-gray-700 truncate">{module.name}</p>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full rounded-lg transition-all duration-1000 ${
                        module.growth > 0
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className={`text-xs font-bold ${
                        barWidth > 30 ? 'text-white' : 'text-gray-700 ml-2'
                      }`}>
                        {module.growth > 0 ? '+' : ''}{module.growth}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-24 text-right">
                  <p className="text-sm font-bold text-gray-900">{module.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">records</p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Dashboard;

