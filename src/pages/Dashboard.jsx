// import React, { useEffect, useRef, useState } from "react";
// import Navbar from "../components/Navbar";
// import { useSelector } from "react-redux";
// import { getTicketDashboard, getVibeCalendar } from "../api";
// import {
//   getItemInLocalStorage,
//   setItemInLocalStorage,
// } from "../utils/localStorage";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import wave from "/wave.png";
// import HighchartsComponent from "../components/HighCharts";
// import TicketDashboard from "./SubPages/TicketDashboard";
// import CommunicationDashboard from "./SubPages/CommunicationDashboard";
// import SoftServiceHighCharts from "../components/SoftServicesHighCharts";
// import { getSiteData, siteChange } from "../api";
// import { MdExpandLess, MdExpandMore } from "react-icons/md";
// import { FaBuilding } from "react-icons/fa";
// import AssetDashboard from "./SubPages/AssetDashboard";
// import ComplianceDashboard from "./SubPages/ComplianceDashboard";
// import logo from "/logo12.jpg";
// import PPMCalendarDashboard from "./SubPages/PPMCalendarDashboard";
// const Dashboard = () => {
//   const themeColor = useSelector((state) => state.theme.color);
//   const vibeUserId = getItemInLocalStorage("VIBEUSERID");
//   const [feat, setFeat] = useState("");
//   const [site, setSite] = useState(false);
//   const [siteData, setSiteData] = useState([]);
//   const dropdownRef = useRef(null);
//   const [siteName, setSiteName] = useState("");
//   console.log(vibeUserId);
//   const contentRef = useRef(null);

//   useEffect(() => {
//     const fetchCalendar = async () => {
//       try {
//         const calendarResponse = await getVibeCalendar(vibeUserId);
//         console.log(calendarResponse);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     getAllowedFeatures();
//     fetchCalendar();
//   }, []);

//   const getAllowedFeatures = () => {
//     const storedFeatures = getItemInLocalStorage("FEATURES");
//     if (storedFeatures) {
//       setFeat(storedFeatures.map((feature) => feature.feature_name));
//     }
//   };

//   const toggleFullScreen = () => {
//     const element = contentRef.current;
//     if (document.fullscreenElement) {
//       document.exitFullscreen();
//     } else {
//       element.requestFullscreen().catch((err) => {
//         console.log(
//           `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
//         );
//       });
//     }
//   };
//   // const currentDate = new Date();
//   // const datePickerRef = useRef(null);
//   // const [dueDate, setDueDate] = useState(null);
//   // const handleDateChange1 = async (date) => {
//   //   setDueDate(date); // Update the selected date in the state
//   //   Update_Task_Duedate(user_id, taskid, date);
//   // };

//   const toggleSite = () => {
//     setSite(!site);
//   };

//   useEffect(() => {
//     const fetchSiteData = async () => {
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
//   const site_name = getItemInLocalStorage("SITENAME");
//   const handleSiteChange = async (id, site) => {
//     try {
//       const response = await siteChange(id);
//       setItemInLocalStorage("SITEID", id);
//       setItemInLocalStorage("SITENAME", site);
//       window.location.reload();
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const handleClickOutside = (event) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       setSite(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);
//   return (
//     <section
//       className="flex"
//       ref={contentRef}
//       //   style={{
//       //   background: `url(${wave})`,
//       //   // backgroundSize: "100% 100% ",
//       //   backgroundSize: "cover",
//       //   backgroundRepeat: "no-repeat",
//       //   backgroundPosition: "center",
//       // }}
//     >
//       <Navbar />
//       <div className=" w-full flex lg:mx-3 flex-col overflow-hidden mb-10">
//         <header
//           style={{ background: themeColor }}
//           className="w-full h-10 rounded-md  my-1 flex justify-between items-center"
//         >
//           {/* <div></div> */}
//           <nav>
//             <h1 className="text-white text-center text-xl ml-5">
//               Vibe Connect
//             </h1>
//             {/* <img src={logo} className="w-20 h-8 ml-2" /> */}
//           </nav>

//           <div className="relative" ref={dropdownRef}>
//             <div
//               onClick={toggleSite}
//               className="cursor-pointer flex items-center gap-2 font-medium p-2 text-white"
//             >
//               <FaBuilding />
//               {/* <h2>{siteName}</h2> */}
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
//                       setSiteName(site.name_with_region);
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
//         <div className="m-5">
//           <TicketDashboard />
//         </div>
//         {feat.includes("assets") && (
//           <div className="w-full flex flex-col p-2  ">
//             <h2 className="border-b-2 border-black font-medium mb-2">Asset</h2>
//             <AssetDashboard />
//           </div>
//         )}
//         {feat.includes("assets") && (
//           <div className="w-full flex flex-col p-2  ">
//             <h2 className="border-b-2 border-black font-medium mb-2">
//               PPM Calendar
//             </h2>
//             <PPMCalendarDashboard />
//           </div>
//         )}
//         <div className="w-full flex mx-3 flex-col p-2  ">
//           <HighchartsComponent />
//         </div>
//         {feat.includes("compliance") && (
//           <div className="w-full flex flex-col p-2  ">
//             <h2 className="border-b-2 border-black font-medium mb-2">
//               Compliance
//             </h2>
//             <ComplianceDashboard />
//           </div>
//         )}
//         {feat.includes("soft_services") && (
//           <div className="w-full flex mx-3 flex-col p-2  ">
//             <h2 className="border-b-2 border-black font-medium mb-10">
//               Soft Services
//             </h2>
//             <SoftServiceHighCharts />
//           </div>
//         )}

//         {feat.includes("communication") && (
//           <div className="w-full flex mx-3 flex-col p-2 mb-10 ">
//             <h2 className="border-b-2 border-black font-medium">
//               Communication
//             </h2>
//             <CommunicationDashboard />
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Dashboard;

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getVibeCalendar } from "../api";
import {
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "../utils/localStorage";
import { getSiteData, siteChange } from "../api";
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
  Shield
} from 'lucide-react';

const Dashboard = () => {
  const themeColor = useSelector((state) => state.theme.color);
  const vibeUserId = getItemInLocalStorage("VIBEUSERID");
  const [site, setSite] = useState(false);
  const [siteData, setSiteData] = useState([]);
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const calendarResponse = await getVibeCalendar(vibeUserId);
        console.log(calendarResponse);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCalendar();
  }, []);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const response = await getSiteData();
        setSiteData(response.data.sites);
        console.log(response.data.sites);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchSiteData();
  }, []);

  const site_name = getItemInLocalStorage("SITENAME");
  
  const handleSiteChange = async (id, site) => {
    try {
      const response = await siteChange(id);
      setItemInLocalStorage("SITEID", id);
      setItemInLocalStorage("SITENAME", site);
      window.location.reload();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const toggleSite = () => {
    setSite(!site);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setSite(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Summary data
  const summaryCards = [
    { title: 'Total Modules', value: '12', icon: Activity, color: 'from-violet-500 to-purple-600' },
    { title: 'Total Records', value: '21,677', icon: FileText, color: 'from-emerald-500 to-teal-600' },
    { title: 'Avg. Growth', value: '+7.5%', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
  ];

  // Module data
  const modules = [
    {
      name: 'Service Desk',
      icon: Wrench,
      total: 1247,
      growth: 12.5,
      color: 'from-blue-500 to-cyan-600',
      submodules: [
        { name: 'Open Tickets', count: 156 },
        { name: 'In Progress', count: 89 },
      ],
      progress: 65
    },
    {
      name: 'Asset',
      icon: Package,
      total: 3456,
      growth: 8.3,
      color: 'from-purple-500 to-pink-600',
      submodules: [
        { name: 'Assets', count: 2150 },
        { name: 'AMC', count: 234 },
      ],
      progress: 78
    },
    {
      name: 'Soft Services',
      icon: Sparkles,
      total: 892,
      growth: -2.1,
      color: 'from-amber-500 to-orange-600',
      submodules: [
        { name: 'Services', count: 456 },
        { name: 'Checklists', count: 234 },
      ],
      progress: 42
    },
    {
      name: 'VMS',
      icon: Users,
      total: 5623,
      growth: 15.7,
      color: 'from-indigo-500 to-blue-600',
      submodules: [
        { name: 'Visitors', count: 3450 },
        { name: 'Vehicles', count: 890 },
      ],
      progress: 88
    },
    {
      name: 'Amenities Booking',
      icon: CalendarIcon,
      total: 678,
      growth: 5.2,
      color: 'from-rose-500 to-red-600',
      submodules: [
        { name: 'Active', count: 234 },
        { name: 'Upcoming', count: 156 },
      ],
      progress: 52
    },
    {
      name: 'Space Booking',
      icon: CalendarIcon,
      total: 1234,
      growth: 9.8,
      color: 'from-teal-500 to-cyan-600',
      submodules: [
        { name: 'Booked', count: 456 },
        { name: 'Available', count: 345 },
      ],
      progress: 71
    },
    {
      name: 'F&B',
      icon: Coffee,
      total: 2345,
      growth: 18.4,
      color: 'from-yellow-500 to-amber-600',
      submodules: [
        { name: 'Restaurant', count: 1234 },
        { name: 'Pantry', count: 1111 },
      ],
      progress: 85
    },
    {
      name: 'Incident',
      icon: AlertTriangle,
      total: 156,
      growth: -5.6,
      color: 'from-red-500 to-rose-600',
      submodules: [
        { name: 'Open', count: 23 },
        { name: 'Investigating', count: 45 },
      ],
      progress: 35
    },
    {
      name: 'Documents',
      icon: FileCheck,
      total: 4567,
      growth: 3.2,
      color: 'from-slate-500 to-gray-600',
      submodules: [
        { name: 'Personal', count: 1234 },
        { name: 'Common', count: 2345 },
      ],
      progress: 62
    },
    {
      name: 'Fitout',
      icon: Hammer,
      total: 234,
      growth: 7.1,
      color: 'from-orange-500 to-red-600',
      submodules: [
        { name: 'Active', count: 89 },
        { name: 'Completed', count: 123 },
      ],
      progress: 58
    },
    {
      name: 'Calendar',
      icon: ClipboardList,
      total: 789,
      growth: 11.3,
      color: 'from-green-500 to-teal-600',
      submodules: [
        { name: 'Events', count: 345 },
        { name: 'Tasks', count: 234 },
      ],
      progress: 74
    },
    {
      name: 'Audit',
      icon: Shield,
      total: 456,
      growth: 6.8,
      color: 'from-violet-500 to-indigo-600',
      submodules: [
        { name: 'Operational', count: 234 },
        { name: 'Vendor', count: 222 },
      ],
      progress: 68
    },
  ];

  // Prepare chart data
  const pieData = [
    { name: 'Service Desk', value: 1247 },
    { name: 'Asset', value: 3456 },
    { name: 'Soft Services', value: 892 },
    { name: 'VMS', value: 5623 },
    { name: 'F&B', value: 2345 },
    { name: 'Documents', value: 4567 },
  ];

  const barData = modules.map(m => ({ name: m.name, value: m.total }));

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

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={toggleSite}
              className="cursor-pointer flex items-center gap-2 font-medium p-2 text-white"
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
              <div className="absolute right-0 bg-white border-2 rounded shadow-md max-h-80 w-80 overflow-y-auto z-10 px-5 space-y-2 py-2">
                {siteData.map((site, index) => (
                  <button
                    key={site.id}
                    onClick={() => {
                      handleSiteChange(site.id, site.name_with_region);
                    }}
                    className="hover:text-gray-500"
                  >
                    {site.name_with_region}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="w-full px-6 py-4">
          {/* Page Title */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
            <p className="text-lg text-gray-600 font-medium">Welcome to FM Module</p>
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
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{card.title}</p>
                      <p className="text-4xl font-bold text-gray-900">{card.value}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Modules Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <div 
                    key={index} 
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
                          <span className="text-gray-900 font-bold">{sub.count}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</span>
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
              {/* Pie Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Overall Module Distribution</h3>
                <SimplePieChart data={pieData} />
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Module-wise Records</h3>
                <SimpleBarChart data={barData} />
              </div>
            </div>

            {/* Line Chart - Full Width */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{ animationDelay: '0.4s', opacity: 0 }}>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Growth Trend</h3>
              <SimpleLineChart modules={modules} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Simple Pie Chart Component
const SimplePieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-indigo-500 to-blue-600',
    'from-yellow-500 to-amber-600',
    'from-slate-500 to-gray-600',
  ];

  let currentAngle = 0;
  const radius = 100;
  const centerX = 120;
  const centerY = 120;

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + radius * Math.cos((Math.PI * startAngle) / 180);
    const y1 = centerY + radius * Math.sin((Math.PI * startAngle) / 180);
    const x2 = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
    const y2 = centerY + radius * Math.sin((Math.PI * endAngle) / 180);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const path = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    return { path, percentage, color: colors[index % colors.length], name: item.name };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="240" className="mb-6">
        {slices.map((slice, index) => (
          <g key={index}>
            <defs>
              <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`${slice.color.split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" />
                <stop offset="100%" className={`${slice.color.split(' ')[2].replace('to-', 'text-')}`} stopColor="currentColor" />
              </linearGradient>
            </defs>
            <path
              d={slice.path}
              fill={`url(#gradient-${index})`}
              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              style={{ transformOrigin: `${centerX}px ${centerY}px` }}
            />
          </g>
        ))}
      </svg>
      
      <div className="grid grid-cols-2 gap-3 w-full">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${slice.color}`}></div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700">{slice.name}</p>
              <p className="text-xs text-gray-500">{slice.percentage.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data }) => {
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
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-700">{item.name}</span>
              <span className="text-xs font-bold text-gray-900">{item.value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colors[index % colors.length]} progress-bar rounded-full`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Simple Line Chart Component
const SimpleLineChart = ({ modules }) => {
  const maxGrowth = Math.max(...modules.map(m => Math.abs(m.growth)));
  const chartHeight = 200;
  const chartWidth = 100;
  
  const points = modules.map((module, index) => {
    const x = (index / (modules.length - 1)) * chartWidth;
    const normalizedGrowth = ((module.growth + maxGrowth) / (2 * maxGrowth)) * chartHeight;
    const y = chartHeight - normalizedGrowth;
    return { x, y, growth: module.growth, name: module.name };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="relative">
      <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} preserveAspectRatio="none" className="w-full">
        {/* Zero line */}
        <line
          x1="0"
          y1={chartHeight / 2}
          x2={chartWidth}
          y2={chartHeight / 2}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        
        {/* Gradient for area under curve */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Area under curve */}
        <path
          d={`${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
          fill="url(#lineGradient)"
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          className="transition-all duration-500"
        />
        
        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#10b981"
              className="transition-all duration-300 hover:r-5"
            />
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {points.map((point, index) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600 font-medium">{point.name}:</span>
            <span className={`font-bold ${point.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {point.growth > 0 ? '+' : ''}{point.growth}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
