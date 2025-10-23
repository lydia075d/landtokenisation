import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { Upload, FileText, Image, AlertCircle, CheckCircle, Building2, MapPin, User, DollarSign, FileCheck } from "lucide-react";

export default function PropertyForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    submitted_by: "",
    agent_name: "",
    agent_code: "",
    agent_phone: "",
    state: "",
    city: "",
    street: "",
    pincode: "",
    google_code: "",
    entrance_direction: "",
    owner_name: "",
    owner_email: "",
    owner_mobile: "",
    location: "",
    category: "",
    property_size: "",
    dimensions: "",
    ownership_type: "",
    sale_type: "",
    approval_type: "",
    address: "",
    entrance_facing: "",
    seller_price: "",
    neighbourhood_pricing: "",
  };

  const initialDocuments = {
    patta: null,
    ec: null,
    title_deed: null,
    parental_doc: null,
    power_of_attorney: null,
    land_tax_receipt: null,
  };

  const initialPhotos = {
    street: null,
    entrance: null,
    inside: null,
    drone: null,
  };

  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [documents, setDocuments] = useState(initialDocuments);
  const [projectPhotos, setProjectPhotos] = useState(initialPhotos);
  const generalFilesRef = useRef();
  const documentRefs = {
    patta: useRef(),
    ec: useRef(),
    title_deed: useRef(),
    parental_doc: useRef(),
    power_of_attorney: useRef(),
    land_tax_receipt: useRef(),
  };
  const photoRefs = {
    street: useRef(),
    entrance: useRef(),
    inside: useRef(),
    drone: useRef(),
  };

  useEffect(() => {
    if (user?.id) {
      setForm((prevForm) => ({
        ...prevForm,
        submitted_by: user.id,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = (e, field) => {
    setDocuments({ ...documents, [field]: e.target.files[0] });
  };

  const handlePhotoUpload = (e, type) => {
    setProjectPhotos({ ...projectPhotos, [type]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user?.id) {
      alert("Please log in to submit a property");
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    if (files.length === 0) {
      alert("Please upload at least one document");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    for (const [key, value] of Object.entries(form)) {
      formData.append(key, value);
    }

    files.forEach((file) => formData.append("documents", file));

    Object.entries(documents).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    Object.entries(projectPhotos).forEach(([key, file]) => {
      if (file) formData.append(`photo_${key}`, file);
    });

    try {
      await axios.post(
        "http://localhost:5001/api/properties/submit",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Property submitted successfully!");

      setForm({ ...initialForm, submitted_by: user.id });
      setFiles([]);
      setDocuments(initialDocuments);
      setProjectPhotos(initialPhotos);

      if (generalFilesRef.current) generalFilesRef.current.value = null;
      Object.values(documentRefs).forEach((ref) => {
        if (ref.current) ref.current.value = null;
      });
      Object.values(photoRefs).forEach((ref) => {
        if (ref.current) ref.current.value = null;
      });

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        "Submission failed. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredUpload = (label, name, handler, ref, icon = FileText) => {
    const Icon = icon;
    const hasFile = documents[name] || projectPhotos[name];
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Icon size={16} className="text-red-600" />
          {label} <span className="text-red-600">*</span>
        </label>
        <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 ${
          hasFile 
            ? "border-green-400 bg-green-50 shadow-sm" 
            : "border-gray-300 bg-white hover:border-red-400 hover:bg-red-50 hover:shadow-md"
        }`}>
          <input
            ref={ref}
            type="file"
            required
            onChange={(e) => handler(e, name)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isSubmitting}
          />
          <div className="flex flex-col items-center gap-2">
            {hasFile ? (
              <>
                <CheckCircle size={24} className="text-green-600" />
                <p className="text-xs font-medium text-green-700">{(documents[name] || projectPhotos[name])?.name}</p>
              </>
            ) : (
              <>
                <Upload size={24} className="text-gray-400" />
                <p className="text-xs text-gray-600 font-medium">Click to upload or drag and drop</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const inputField = (label, name, optional = false) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {!optional && <span className="text-red-600"> *</span>}
      </label>
      <input
        type="text"
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        required={!optional}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white transition-all duration-200 hover:border-gray-400"
        placeholder={label}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cover bg-center px-4 py-12 relative"
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
            {/* Header */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg mb-4">
                <Building2 size={40} className="text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Submit New Property
              </h1>
              <p className="text-gray-600 text-lg">Fill in all required details and upload necessary documents</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="h-1 w-16 bg-red-600 rounded-full"></div>
                <div className="h-1 w-8 bg-red-400 rounded-full"></div>
                <div className="h-1 w-4 bg-red-300 rounded-full"></div>
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 space-y-10">
              <form onSubmit={handleSubmit} className="space-y-10">

                {/* Agent Information Section */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                      <User size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Agent Information</h2>
                      <p className="text-sm text-gray-600">Details about the property agent</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {inputField("Agent Name", "agent_name")}
                    {inputField("Agent Code", "agent_code")}
                    {inputField("Agent Phone", "agent_phone")}
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Property Location Section */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <MapPin size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Property Location</h2>
                      <p className="text-sm text-gray-600">Geographic details of the property</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {inputField("State", "state")}
                    {inputField("City", "city")}
                    {inputField("Street", "street")}
                    {inputField("Pincode", "pincode")}
                    {inputField("Google Code", "google_code", true)}
                    {inputField("Address", "address")}
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Property Details Section */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                      <Building2 size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
                      <p className="text-sm text-gray-600">Specifications and characteristics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Category <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white transition-all duration-200 hover:border-gray-400"
                        disabled={isSubmitting}
                      >
                        <option value="">Select Category</option>
                        <option value="A – 6 Months SELL OUT">A – 6 Months SELL OUT</option>
                        <option value="B – Monetized Property">B – Monetized Property</option>
                        <option value="C – 18 months SELL OUT">C – 18 months SELL OUT</option>
                        <option value="D – 24 months SELL OUT">D – 24 months SELL OUT</option>
                      </select>
                    </div>
                    {inputField("Location", "location")}
                    {inputField("Property Size", "property_size")}
                    {inputField("Dimensions", "dimensions")}
                    {inputField("Ownership Type", "ownership_type")}
                    {inputField("Sale Type", "sale_type")}
                    {inputField("Approval Type", "approval_type")}
                    {inputField("Entrance Direction", "entrance_direction")}
                    {inputField("Entrance Facing", "entrance_facing")}
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Owner Information Section */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                      <User size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Owner Information</h2>
                      <p className="text-sm text-gray-600">Property owner contact details</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {inputField("Owner Name", "owner_name")}
                    {inputField("Owner Email", "owner_email")}
                    {inputField("Owner Mobile", "owner_mobile")}
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Pricing Section */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                      <DollarSign size={20} className="text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Pricing</h2>
                      <p className="text-sm text-gray-600">Financial details and valuation</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {inputField("Seller Price", "seller_price")}
                    {inputField("Neighbourhood Pricing", "neighbourhood_pricing")}
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Legal Documents Section */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                      <FileCheck size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Legal Documents</h2>
                      <p className="text-sm text-gray-600">Required legal documentation</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {requiredUpload("Title Deed", "title_deed", handleDocumentUpload, documentRefs.title_deed)}
                    {requiredUpload("Patta / Chitta", "patta", handleDocumentUpload, documentRefs.patta)}
                    {requiredUpload("EC", "ec", handleDocumentUpload, documentRefs.ec)}
                    {requiredUpload("Parental Document", "parental_doc", handleDocumentUpload, documentRefs.parental_doc)}
                    {requiredUpload("Power of Attorney", "power_of_attorney", handleDocumentUpload, documentRefs.power_of_attorney)}
                    {requiredUpload("Land Tax Receipt", "land_tax_receipt", handleDocumentUpload, documentRefs.land_tax_receipt)}
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Supporting Documents Section */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                      <FileText size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Supporting Documents</h2>
                      <p className="text-sm text-gray-600">Additional documentation and files</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FileText size={16} className="text-red-600" />
                      Other Documents <span className="text-red-600">*</span>
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-400 hover:bg-red-50 transition-all duration-200 hover:shadow-md bg-white">
                      <input
                        ref={generalFilesRef}
                        type="file"
                        multiple
                        required
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isSubmitting}
                      />
                      <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-700 font-semibold mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">Multiple files supported (PDF, DOC, JPG, PNG)</p>
                    </div>
                    {files.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
                        <p className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <CheckCircle size={16} />
                          {files.length} file(s) selected
                        </p>
                        <ul className="space-y-2">
                          {files.map((file, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-white rounded-lg p-2 px-3">
                              <span className="text-xs text-gray-700 font-medium">{file.name}</span>
                              <button
                                type="button"
                                className="ml-2 text-red-500 hover:text-red-700 font-bold text-xl transition-colors"
                                onClick={() => removeFile(idx)}
                                disabled={isSubmitting}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Project Photos Section */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-pink-100 rounded-lg">
                      <Image size={20} className="text-pink-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Project Photos</h2>
                      <p className="text-sm text-gray-600">Visual documentation of the property</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {requiredUpload("Street View", "street", handlePhotoUpload, photoRefs.street, Image)}
                    {requiredUpload("Entrance View", "entrance", handlePhotoUpload, photoRefs.entrance, Image)}
                    {requiredUpload("Inside View", "inside", handlePhotoUpload, photoRefs.inside, Image)}
                    {requiredUpload("Drone View", "drone", handlePhotoUpload, photoRefs.drone, Image)}
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
                  <img 
                    src="/assets/submitproperty.png" 
                    alt="Legal" 
                    className="w-full h-auto object-contain max-h-80"
                  />
                </div>


                {/* Info Box */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl p-5 flex gap-4 shadow-sm">
                  <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-900 font-semibold mb-1">Important Notice</p>
                    <p className="text-sm text-yellow-800">
                      All fields marked with <span className="text-red-600 font-semibold">* </span>  are required. Make sure all documents are clear and legible before submission.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload size={22} />
                  <span className="text-lg">{isSubmitting ? "Submitting..." : "Submit Property"}</span>
                </button>
              </form>
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Your submission will be reviewed by our team within 24-48 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}