import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { CheckCircle, XCircle, FileText, Download, ShoppingCart, ClipboardList } from "lucide-react";

export default function PurchaseHeadDashboard() {
  const [properties, setProperties] = useState([]);
  const team = localStorage.getItem("team") || "Purchase Team";
  const userRole = localStorage.getItem("role") || "purchase";

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login first");
      return;
    }
    
    axios.get(`http://localhost:5001/api/properties/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      const filtered = res.data.filter(property => {
      const isPendingForPurchase = property.status === 'Legally Cleared' || 
                                   property.status === 'Pending Purchase Review';
        const rejectedByPurchaseTeam = property.rejected_by === "Purchase Team" ||
                                     property.rejected_by === "Purchase";
        
        return isPendingForPurchase || rejectedByPurchaseTeam;
      });
      
      console.log('Filtered properties for Purchase Team:', filtered.length);
      setProperties(filtered);
    })
    .catch((error) => {
      console.error("Error loading properties:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("team");
      } else {
        alert("Could not load properties");
      }
    });
  }, [team]);

  const approveProperty = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5001/api/properties/approve/${id}`,
        { team: team },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Approval successful:", response.data);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      alert(`Property approved by ${team} and moved to next team!`);
    } catch (error) {
      console.error("Approval failed:", error);
      
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("team");
      } else if (error.response?.status === 403) {
        alert(`Permission denied: ${error.response?.data?.msg || error.response?.data?.message || 'Please check your team permissions'}`);
      } else {
        alert(`Approval failed: ${error.response?.data?.msg || error.response?.data?.message || error.message}`);
      }
    }
  };

  const rejectProperty = async (id) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login first");
      return;
    }
    
    try {
      await axios.put(
        `http://localhost:5001/api/properties/${id}/trash`,
        { team: team },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "Rejected", rejected_by: userRole } : p))
      );
      alert(`Property rejected by ${team}`);
    } catch (error) {
      console.error("Rejection failed:", error);
      
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("team");
      } else if (error.response?.status === 403) {
        alert(`Permission denied: ${error.response?.data?.msg || error.response?.data?.message || 'Please check your team permissions'}`);
      } else {
        alert(`Rejection failed: ${error.response?.data?.msg || error.response?.data?.message || error.message}`);
      }
    }
  };

  const getApprovalProgress = (p) => {
    const defaultTeams = [
      "Property Team",
      "Legal Team", 
      "Purchase Team",
      "Finance Team", 
      "Tech Team",
      "Token Team",
      "Admin",
    ];

    let approvals = {};
    if (p.team_approvals) {
      try {
        approvals = typeof p.team_approvals === 'string' 
          ? JSON.parse(p.team_approvals) 
          : p.team_approvals;
      } catch (e) {
        console.error("Failed to parse team_approvals:", e);
        approvals = {};
      }
    }

    const visibleApprovals = {};
    for (let i = 0; i < defaultTeams.length; i++) {
      const currentTeam = defaultTeams[i];
      const status = approvals[currentTeam];
      
      if (status === "Approved") {
        visibleApprovals[currentTeam] = "Approved";
      } else if (status === "Rejected" || p.rejected_by === currentTeam) {
        visibleApprovals[currentTeam] = "Rejected";
        break;
      } else {
        let allPreviousApproved = true;
        for (let j = 0; j < i; j++) {
          if (approvals[defaultTeams[j]] !== "Approved") {
            allPreviousApproved = false;
            break;
          }
        }
        if (allPreviousApproved) {
          visibleApprovals[currentTeam] = "Pending";
          break;
        }
      }
    }

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(visibleApprovals).map(([teamName, status], idx) => {
          let bg = "bg-gray-300 text-gray-900";
          if (status === "Approved") bg = "bg-green-500 text-white";
          else if (status === "Pending") bg = "bg-yellow-400 text-gray-900";
          else if (status === "Rejected") bg = "bg-red-600 text-white";

          return (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${bg}`}
            >
              {teamName}: {status}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div 
        className="min-h-screen bg-cover bg-center px-4 py-12 relative"
        style={{
          backgroundImage: `url("/assets/map-bg.jpg")`,
          backgroundRepeat: "no-repeat", 
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex justify-between items-start md:items-center mb-8 gap-6 flex-wrap">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    {team} Dashboard
                  </h1>
                  <p className="text-gray-600 text-lg">Review and process property purchases</p>
                </div>
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2">
                  <ClipboardList size={20} />
                  Pending: {properties.length}
                </div>
              </div>

              {/* Image and Stats Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
                  <img 
                    src="/assets/purchase.png" 
                    alt="Purchase" 
                    className="w-full h-auto object-contain max-h-80"
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-600 flex-1">
                    <div className="flex items-center justify-between h-full">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Properties Pending</p>
                        <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
                      </div>
                      <ClipboardList size={40} className="text-red-600 opacity-20" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-600 flex-1">
                    <div className="flex items-center justify-between h-full">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Team</p>
                        <p className="text-xl font-bold text-gray-900">{team}</p>
                      </div>
                      <ShoppingCart size={40} className="text-blue-600 opacity-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1 w-12 bg-red-600 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">Properties Awaiting Review</h2>
                <span className="text-sm font-semibold text-white bg-red-600 px-3 py-1 rounded-full">
                  {properties.length}
                </span>
              </div>

              {properties.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {properties.map((p) => {
                    const isRejectedByThisTeam = p.rejected_by === team || 
                      (team === "Purchase Team" && (p.rejected_by === "Purchase" || p.rejected_by === "Purchase Team"));
                    
                    return (
                      <div
                        key={p.id}
                        className={`relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border-l-4 ${
                          isRejectedByThisTeam
                            ? "bg-red-50 border-red-400 hover:bg-red-100"
                            : "bg-blue-50 border-blue-400 hover:bg-blue-100"
                        }`}
                      >
                        <div className="p-6">
                          {isRejectedByThisTeam && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                              <XCircle size={14} />
                              Rejected
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-600 text-sm font-medium">Location</p>
                              <p className={`text-xl font-bold ${isRejectedByThisTeam ? "text-red-600" : "text-blue-600"}`}>
                                {p.city}, {p.state}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm font-medium">Property Value</p>
                              <p className={`text-xl font-bold ${isRejectedByThisTeam ? "text-red-600" : "text-blue-600"}`}>
                                ₹{parseInt(p.seller_price).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm font-medium">Agent</p>
                              <p className="text-gray-900 font-medium">{p.agent_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm font-medium">Owner</p>
                              <p className="text-gray-900 font-medium">{p.owner_name}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-gray-600 text-sm font-medium mb-2">Status</p>
                            <p className={`text-sm font-semibold ${isRejectedByThisTeam ? "text-red-600" : "text-blue-600"}`}>
                              {p.status}
                            </p>
                          </div>

                          <div className="mb-4">
                            <p className="text-gray-600 text-sm font-medium mb-2">Approval Progress</p>
                            {getApprovalProgress(p)}
                          </div>

                          {isRejectedByThisTeam && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                              <p className="text-red-700 font-semibold text-sm">
                                This property was rejected by your team
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3">
                            {!isRejectedByThisTeam && (
                              <>
                                <button 
                                  onClick={() => approveProperty(p.id)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                                >
                                  <CheckCircle size={18} />
                                  Approve & Send Next
                                </button>
                                <button 
                                  onClick={() => rejectProperty(p.id)}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                                >
                                  <XCircle size={18} />
                                  Reject
                                </button>
                              </>
                            )}

                            <a
                              href={`data:application/json,${encodeURIComponent(
                                JSON.stringify(p, null, 2)
                              )}`}
                              download={`property-${p.id}.json`}
                              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition font-semibold flex items-center justify-center gap-2"
                            >
                              <FileText size={18} />
                              Details
                            </a>

                            <a
                              href={`http://localhost:5001/api/properties/${p.id}/download`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                            >
                              <Download size={18} />
                              Files
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 shadow-md border-2 border-dashed border-gray-300 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-red-100 rounded-full p-6">
                      <ShoppingCart size={48} className="text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Properties</h3>
                  <p className="text-gray-600">
                    All submitted properties have been processed by the {team}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}