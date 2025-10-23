import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  Shield, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Settings, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Building2,
  FileCheck
} from "lucide-react";

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);

  const fetchProperties = () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get("http://localhost:5001/api/properties/all", { headers })
      .then((res) => setProperties(res.data))
      .catch((error) => {
        console.error("Error loading properties:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
        } else {
          alert("Could not load properties");
        }
      });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const deleteProperty = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this property?")) {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      axios
        .delete(`http://localhost:5001/api/properties/${id}/delete`, { headers })
        .then(() => {
          alert("Property permanently deleted.");
          fetchProperties();  
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          if (error.response?.status === 401) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("token");
          } else {
            alert("Failed to delete property");
          }
        });
    }
  };

  const undoRejection = (id) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .put(`http://localhost:5001/api/properties/${id}/undo-rejection`, {}, { headers })
      .then(() => {
        alert("Rejection undone");
        fetchProperties();  
      })
      .catch((error) => {
        console.error("Undo rejection failed:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
        } else {
          alert("Failed to undo rejection");
        }
      });
  };

  // Calculate statistics
  const stats = {
    total: properties.length,
    approved: properties.filter(p => p.status === "Approved" || p.status === "Completed").length,
    pending: properties.filter(p => p.status === "Pending" || p.status === "Shortlisted").length,
    rejected: properties.filter(p => p.rejected_by && p.rejected_by !== "" && p.rejected_by !== null).length,
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
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex justify-between items-start md:items-center mb-8 gap-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg">
                      <Shield size={24} className="text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                      Admin Dashboard
                    </h1>
                  </div>
                  <p className="text-gray-600 text-lg ml-15">Complete property management control</p>
                </div>
                <Link to="/submit-property">
                  <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Plus size={20} />
                    Submit New Property
                  </button>
                </Link>
              </div>

              {/* Image and Stats Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
                  <img 
                    src="/assets/admin.png" 
                    alt="Admin" 
                    className="w-full h-auto object-contain max-h-80"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total Properties</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                      </div>
                      <Building2 size={40} className="text-blue-600 opacity-20" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Approved</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                      </div>
                      <CheckCircle size={40} className="text-green-600 opacity-20" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Pending</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                      </div>
                      <Clock size={40} className="text-yellow-600 opacity-20" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Rejected</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                      </div>
                      <XCircle size={40} className="text-red-600 opacity-20" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Statistics Row (Optional) */}
              <div className=" grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 hidden">
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Properties</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Building2 size={40} className="text-blue-600 opacity-20" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Approved</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                    </div>
                    <CheckCircle size={40} className="text-green-600 opacity-20" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Pending</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                    </div>
                    <Clock size={40} className="text-yellow-600 opacity-20" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Rejected</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                    </div>
                    <XCircle size={40} className="text-red-600 opacity-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1 w-12 bg-red-600 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">All Properties</h2>
                <span className="text-sm font-semibold text-white bg-red-600 px-3 py-1 rounded-full">
                  {properties.length}
                </span>
              </div>

              {properties.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {properties.map((p) => {
                    const isRejected = !!(p.rejected_by && p.rejected_by !== "" && p.rejected_by !== null);
                    const isApproved = p.status === "Approved" || p.status === "Completed";
                    const isPending = p.status === "Pending" || p.status === "Shortlisted";

                    return (
                      <div
                        key={p.id}
                        className={`relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border-l-4 ${
                          isRejected
                            ? "bg-red-50 border-red-400 hover:bg-red-100"
                            : isApproved
                            ? "bg-green-50 border-green-400 hover:bg-green-100"
                            : "bg-blue-50 border-blue-400 hover:bg-blue-100"
                        }`}
                      >
                        <div className="p-6">
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            {isRejected ? (
                              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                <XCircle size={14} />
                                Rejected
                              </span>
                            ) : isApproved ? (
                              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                <CheckCircle size={14} />
                                Approved
                              </span>
                            ) : (
                              <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                <Clock size={14} />
                                Pending
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-gray-600 text-sm font-medium flex items-center gap-1">
                                <MapPin size={14} />
                                Location
                              </p>
                              <p className={`text-xl font-bold ${
                                isRejected ? "text-red-600" : isApproved ? "text-green-600" : "text-blue-600"
                              }`}>
                                {p.city}, {p.state}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-gray-600 text-sm font-medium">Agent</p>
                              <p className="text-gray-900 font-medium">{p.agent_name || "N/A"}</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-600 text-sm font-medium">Owner</p>
                              <p className="text-gray-900 font-medium">{p.owner_name || "N/A"}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-gray-600 text-sm font-medium mb-2">Current Status</p>
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  isApproved
                                    ? "bg-green-500 text-white"
                                    : isPending
                                    ? "bg-yellow-400 text-gray-900"
                                    : "bg-gray-300 text-gray-900"
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                          </div>

                          {isRejected && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                              <p className="text-red-700 font-semibold text-sm flex items-center gap-2">
                                <XCircle size={16} />
                                Rejected by: <span className="text-red-900">{p.rejected_by}</span>
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            {isRejected ? (
                              <>
                                <button
                                  onClick={() => undoRejection(p.id)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                                >
                                  <RotateCcw size={18} />
                                  Undo Rejection
                                </button>
                                <button
                                  onClick={() => deleteProperty(p.id)}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                                >
                                  <Trash2 size={18} />
                                  Delete Permanently
                                </button>
                              </>
                            ) : (
                              <Link to={`/property/${p.id}`} className="flex-1">
                                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
                                  <Settings size={18} />
                                  Manage Property
                                </button>
                              </Link>
                            )}
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
                      <Building2 size={48} className="text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Found</h3>
                  <p className="text-gray-600 mb-4">
                    Get started by submitting your first property.
                  </p>
                  <Link to="/submit-property">
                    <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold inline-flex items-center gap-2">
                      <Plus size={20} />
                      Submit New Property
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}