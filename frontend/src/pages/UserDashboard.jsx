import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Home, FileText, Download, TrendingUp, AlertCircle } from "lucide-react";

export default function UserDashboard() {
  const [userProperties, setUserProperties] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);
   
 useEffect(() => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  if (!token) {
    alert("Please login first");
    return;
  }

  Promise.all([
    axios.get("http://localhost:5001/api/properties/all", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    axios.get("http://localhost:5001/api/properties/status/Legally Cleared", {
      headers: { Authorization: `Bearer ${token}` },
    })
  ])
  .then(([allRes, legalRes]) => {
    const allProperties = allRes.data;
    const legalProperties = legalRes.data;

    const ownProperties = allProperties.filter(
      p => String(p.submitted_by) === String(userId)
    );

    const othersCleared = legalProperties.filter(
      p => String(p.submitted_by) !== String(userId)
    );

    setUserProperties(ownProperties);
    setAvailableProperties(othersCleared);

    console.log("✅ Own properties:", ownProperties.length);
    console.log("✅ Others' legally cleared:", othersCleared.length);
  })
  .catch((err) => {
    console.error("Failed to load properties:", err);
    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
    } else {
      alert("Failed to load properties");
    }
  });
}, []);

  const handleBuyNow = (propertyId) => {
    alert(`Buy Now clicked for property ${propertyId}. This would redirect to purchase flow.`);
  };
  const downloadFiles = async (propertyId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5001/api/properties/${propertyId}/download`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  
    if (!res.ok) {
      alert("Failed to download files");
      return;
    }
  
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `property_${propertyId}_files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <>
      <Navbar />
      <div
        className="min-h-screen bg-cover bg-center px-4 py-12"
        style={{
          backgroundImage: `url("/assets/map-bg.jpg")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="flex justify-between items-start md:items-center mb-8 gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  Property Dashboard
                </h1>
                <p className="text-gray-600 text-lg">Manage and explore properties seamlessly</p>
              </div>
              <Link to="/submit-property">
                <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 md:px-8 py-3 rounded-full hover:from-red-700 hover:to-red-800 transition transform hover:scale-105 font-semibold shadow-lg flex items-center gap-2">
                  <Home size={20} />
                  Submit New Property
                </button>
              </Link>
            </div>
  
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
                <img 
                  src="/assets/family_user.png" 
                  alt="Family Home" 
                  className="w-full h-auto object-contain max-h-80"
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-600 flex-1">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Your Properties</p>
                      <p className="text-3xl font-bold text-gray-900">{userProperties.length}</p>
                    </div>
                    <Home size={40} className="text-red-600 opacity-20" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-600 flex-1">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Available for Purchase</p>
                      <p className="text-3xl font-bold text-gray-900">{availableProperties.length}</p>
                    </div>
                    <TrendingUp size={40} className="text-green-600 opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-red-600 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900">Your Properties</h2>
              <span className="text-sm font-semibold text-white bg-red-600 px-3 py-1 rounded-full">
                {userProperties.length}
              </span>
            </div>
            
            {userProperties.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {userProperties.map((p) => {
                  const isRejected = p.status === "Rejected";
                  
                  return (
                    <div
                      key={p.id}
                      className={`relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border-l-4 ${
                        isRejected 
                          ? "bg-red-50 border-red-400 hover:bg-red-100" 
                          : "bg-blue-50 border-blue-400 hover:bg-blue-100"
                      }`}
                    >
                      <div className="p-6">
                        {isRejected && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                            <AlertCircle size={14} />
                            Rejected
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-gray-600 text-sm font-medium">Location</p>
                            <p className={`text-xl font-bold ${isRejected ? "text-red-600" : "text-blue-600"}`}>
                              {p.city}, {p.state}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm font-medium">Property Value</p>
                            <p className={`text-xl font-bold ${isRejected ? "text-red-600" : "text-blue-600"}`}>
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
                          <div className="flex items-center gap-2">
                            <div className={`h-2 flex-1 bg-gray-200 rounded-full overflow-hidden`}>
                              <div className={`h-full w-3/4 rounded-full ${isRejected ? "bg-red-500" : "bg-blue-500"}`}></div>
                            </div>
                            <span className={`text-sm font-semibold ${isRejected ? "text-red-600" : "text-blue-600"}`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          
                          <a
                            href={`data:application/json,${encodeURIComponent(
                              JSON.stringify(p, null, 2)
                            )}`}
                            download={`my-property-${p.id}.json`}
                            className={`px-4 py-2 rounded-lg transition font-semibold text-center flex items-center justify-center gap-2 ${
                              isRejected
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            <FileText size={18} />
                            Download Details
                          </a>
                          
                          <a
                            href={`http://localhost:5001/api/properties/${p.id}/download`}
                            className={`px-4 py-2 rounded-lg transition font-semibold text-center flex items-center justify-center gap-2 ${
                              isRejected
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            <Download size={18} />
                            Download Files
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
                    <Home size={48} className="text-red-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Yet</h3>
                <p className="text-gray-600 mb-6">Get started by submitting your first property to the platform.</p>
                <Link to="/submit-property">
                  <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold inline-flex items-center gap-2">
                    <Home size={18} />
                    Submit Your First Property
                  </button>
                </Link>
              </div>
            )}
          </div>
  
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-green-600 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900">Properties Available for Purchase</h2>
              <span className="text-sm font-semibold text-white bg-green-600 px-3 py-1 rounded-full">
                {availableProperties.length}
              </span>
            </div>
            
            {availableProperties.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {availableProperties.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border-l-4 border-green-400 hover:bg-green-50"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Location</p>
                          <p className="text-xl font-bold text-green-600">
                            {p.city}, {p.state}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Property Value</p>
                          <p className="text-xl font-bold text-green-600">
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
                        <div className="flex items-center gap-2">
                          <AlertCircle size={18} className="text-green-600" />
                          <span className="text-sm font-semibold text-green-600">{p.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleBuyNow(p.id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold flex items-center justify-center gap-2"
                        >
                          <TrendingUp size={18} />
                          Buy Now
                        </button>
                        <a
                          href={`data:application/json,${encodeURIComponent(
                            JSON.stringify(p, null, 2)
                          )}`}
                          download={`property-${p.id}.json`}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-semibold text-center flex items-center justify-center gap-2"
                        >
                          <FileText size={18} />
                          View Details
                      
                        </a>
                        <button
                          onClick={() => downloadFiles(p.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          Download Files
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-md border-2 border-dashed border-gray-300 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="bg-green-100 rounded-full p-6">
                    <TrendingUp size={48} className="text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Available</h3>
                <p className="text-gray-600">Check back soon for legally cleared properties available for purchase.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}