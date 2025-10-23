import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  FileText, 
  ShoppingCart,
  DollarSign,
  Home,
  Loader,
  CheckCircle,
  Clock,
  XCircle,
  Compass,
  Ruler,
  FileCheck,
  ChevronLeft
} from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedUserRole = localStorage.getItem("role");
    setCurrentUserId(storedUserId);
    setUserRole(storedUserRole?.toLowerCase());

    axios.get(`http://localhost:5001/api/properties/${id}`)
      .then((res) => {
        setProperty(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading property:", error);
        setLoading(false);
      });
  }, [id]);

  const updateStage = async (direction) => {
    try {
      await axios.put(`http://localhost:5001/api/properties/advance/${id}`, { direction });
      alert("Stage updated!");
      window.location.reload();
    } catch (err) {
      console.error("Stage update failed:", err);
      alert("Stage update failed.");
    }
  };

  const downloadFiles = () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
    axios({
      url: `http://localhost:5001/api/properties/${id}/download`,
      method: "GET",
      responseType: "blob",
      headers,
    })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `property_${id}_files.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.error("Download failed:", error);
        alert("Could not download files.");
      });
  };

  const handlePurchase = async () => {
    try {
      await axios.post(`http://localhost:5001/api/properties/purchase/${id}`, {
        buyer_id: currentUserId,
      });
      alert("Purchase successful!");
      window.location.reload();
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed!");
    }
  };

  const downloadDetails = () => {
    const blob = new Blob([JSON.stringify(property, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `property-${id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
          <div className="text-center">
            <Loader size={48} className="text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-800 font-semibold">Loading property details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!property || !userRole) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
          <div className="text-center">
            <XCircle size={48} className="text-red-600 mx-auto mb-4" />
            <p className="text-xl text-gray-800 font-semibold">Property not found</p>
          </div>
        </div>
      </>
    );
  }

  const isOwner = String(currentUserId) === String(property.owner_id);
  const isAdmin = userRole === "admin";
  const isForSale = property.status === "Available";

  const getStatusBadge = () => {
    const status = property.status;
    if (status === "Approved" || status === "Completed" || status === "Available") {
      return (
        <span className="bg-green-500 text-white text-sm px-4 py-2 rounded-full font-semibold flex items-center gap-2 w-fit">
          <CheckCircle size={16} />
          {status}
        </span>
      );
    } else if (status === "Pending" || status === "Shortlisted") {
      return (
        <span className="bg-yellow-500 text-white text-sm px-4 py-2 rounded-full font-semibold flex items-center gap-2 w-fit">
          <Clock size={16} />
          {status}
        </span>
      );
    } else {
      return (
        <span className="bg-red-500 text-white text-sm px-4 py-2 rounded-full font-semibold flex items-center gap-2 w-fit">
          <XCircle size={16} />
          {status}
        </span>
      );
    }
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
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="mb-6 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold flex items-center gap-2 shadow-md"
            >
              <ChevronLeft size={20} />
              Back
            </button>

            {/* Header with Image */}
            <div className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
                {/* Left: Image */}
                <div className="order-2 lg:order-1">
                  <img 
                    src="/assets/admin2.png" 
                    alt="Property Management Team" 
                    className="w-full h-auto max-w-md mx-auto"
                  />
                </div>
                
                {/* Right: Title */}
                <div className="order-1 lg:order-2 text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg mb-4">
                    <Building2 size={40} className="text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                    Property Details
                  </h1>
                  <p className="text-gray-600 text-lg">Complete information about this property</p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mt-4">
                    <div className="h-1 w-16 bg-red-600 rounded-full"></div>
                    <div className="h-1 w-8 bg-red-400 rounded-full"></div>
                    <div className="h-1 w-4 bg-red-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 space-y-8">
              
              {/* Status Badge */}
              <div className="flex justify-center">
                {getStatusBadge()}
              </div>

              {/* Location Section */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Location</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-13">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">City</p>
                    <p className="text-lg font-bold text-gray-900">{property.city}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">State</p>
                    <p className="text-lg font-bold text-gray-900">{property.state}</p>
                  </div>
                  {property.street && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Street</p>
                      <p className="text-lg font-bold text-gray-900">{property.street}</p>
                    </div>
                  )}
                  {property.pincode && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Pincode</p>
                      <p className="text-lg font-bold text-gray-900">{property.pincode}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Information */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                    <Home size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Property Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-13">
                  {property.property_size && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Ruler size={14} />
                        Property Size
                      </p>
                      <p className="text-lg font-bold text-gray-900">{property.property_size}</p>
                    </div>
                  )}
                  {property.dimensions && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Ruler size={14} />
                        Dimensions
                      </p>
                      <p className="text-lg font-bold text-gray-900">{property.dimensions}</p>
                    </div>
                  )}
                  {property.entrance_facing && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Compass size={14} />
                        Entrance Facing
                      </p>
                      <p className="text-lg font-bold text-gray-900">{property.entrance_facing}</p>
                    </div>
                  )}
                  {property.category && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <FileCheck size={14} />
                        Category
                      </p>
                      <p className="text-lg font-bold text-gray-900">{property.category}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Information */}
              {property.seller_price && (
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                      <DollarSign size={20} className="text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Pricing</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-13">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-l-4 border-yellow-500">
                      <p className="text-sm text-gray-600 mb-1">Seller Price</p>
                      <p className="text-2xl font-bold text-yellow-700">₹{parseInt(property.seller_price).toLocaleString()}</p>
                    </div>
                    {property.neighbourhood_pricing && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Neighbourhood Pricing</p>
                        <p className="text-lg font-bold text-gray-900">₹{parseInt(property.neighbourhood_pricing).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Agent & Owner Information (Visible to Admin and Non-Owners) */}
              {(!isOwner || isAdmin) && (
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                      <User size={20} className="text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-13">
                    {property.agent_name && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <User size={14} />
                          Agent Name
                        </p>
                        <p className="text-lg font-bold text-gray-900">{property.agent_name}</p>
                      </div>
                    )}
                    {property.agent_code && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Agent Code</p>
                        <p className="text-lg font-bold text-gray-900">{property.agent_code}</p>
                      </div>
                    )}
                    {property.agent_phone && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <Phone size={14} />
                          Agent Phone
                        </p>
                        <p className="text-lg font-bold text-gray-900">{property.agent_phone}</p>
                      </div>
                    )}
                    {property.owner_name && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <User size={14} />
                          Owner Name
                        </p>
                        <p className="text-lg font-bold text-gray-900">{property.owner_name}</p>
                      </div>
                    )}
                    {property.owner_email && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <Mail size={14} />
                          Owner Email
                        </p>
                        <p className="text-lg font-bold text-gray-900">{property.owner_email}</p>
                      </div>
                    )}
                    {property.owner_mobile && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <Phone size={14} />
                          Owner Mobile
                        </p>
                        <p className="text-lg font-bold text-gray-900">{property.owner_mobile}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Controls */}
              {userRole === "admin" && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                      <FileText size={20} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Controls</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ml-13">
                    <button
                      onClick={() => updateStage("prev")}
                      className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition font-semibold flex items-center justify-center gap-2 shadow-md"
                    >
                      <ArrowLeft size={18} />
                      Previous Stage
                    </button>
                    <button
                      onClick={() => updateStage("next")}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 shadow-md"
                    >
                      Next Stage
                      <ArrowRight size={18} />
                    </button>
                    <button
                      onClick={downloadDetails}
                      className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition font-semibold flex items-center justify-center gap-2 shadow-md"
                    >
                      <FileText size={18} />
                      Download JSON
                    </button>
                    <button
                      onClick={downloadFiles}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 shadow-md"
                    >
                      <Download size={18} />
                      Download Files
                    </button>
                  </div>
                </div>
              )}

              {/* Purchase Button for Non-Owners */}
              {!isOwner && !isAdmin && isForSale && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Purchase?</h3>
                  <p className="text-gray-600 mb-4">This property is available for immediate purchase.</p>
                  <button
                    onClick={handlePurchase}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-bold shadow-lg flex items-center gap-2 transform hover:scale-105"
                  >
                    <ShoppingCart size={20} />
                    Purchase Property
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}