const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const insertProperty = (data, cb) => {
  const {
    submitted_by,
    agent_name,
    agent_code,
    agent_phone,
    state,
    city,
    street,
    pincode,
    google_code,
    entrance_direction,
    owner_name,
    owner_email,
    owner_mobile,
    location,
    category,
    property_size,
    dimensions,
    ownership_type,
    sale_type,
    approval_type,
    address,
    entrance_facing,
    title_deed,
    patta_chitta,   
    ec,
    parental_doc,
    power_of_attorney,
    land_tax_receipt,
    seller_price,
    neighbourhood_pricing,
    street_view,
    entrance_view,
    inside_view,
    drone_view,
  } = data;

  const property_id = uuidv4();
  const status = "Pending Verification";
  const current_phase = "Initial";
  const asking_price = null;
  const final_price = null;
  const token_count = null;
  const submission_date = new Date();
  const created_at = new Date();
  const updated_at = new Date();

  const teamApprovals = JSON.stringify({
    "Property Team": "Pending",
    "Legal Team": "Pending",
    "Purchase Team": "Pending",
    "Finance Team": "Pending",
    "Tech Team": "Pending",
    "Token Team": "Pending",
    "Admin": "Pending",
  });

  const query = `
    INSERT INTO properties 
    (property_id, agent_name, agent_code, agent_phone, submitted_by, status, current_phase, 
     state, city, street, pincode, google_code, entrance_direction,
     owner_name, owner_email, owner_mobile, location, category, 
     property_size, dimensions, ownership_type, sale_type, approval_type, 
     address, entrance_facing,
     title_deed, patta_chitta, ec, parental_doc, power_of_attorney, land_tax_receipt,
     seller_price, neighbourhood_pricing,
     street_view, entrance_view, inside_view, drone_view,
     asking_price, final_price, token_count,
     submission_date, created_at, updated_at,
     team_approvals)   
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    property_id,
    agent_name, agent_code, agent_phone, submitted_by, status, current_phase,
    state, city, street, pincode, google_code, entrance_direction,
    owner_name, owner_email, owner_mobile, location, category,
    property_size, dimensions, ownership_type, sale_type, approval_type,
    address, entrance_facing,
    title_deed, patta_chitta, ec, parental_doc, power_of_attorney, land_tax_receipt,
    seller_price, neighbourhood_pricing,
    street_view, entrance_view, inside_view, drone_view,
    asking_price, final_price, token_count,
    submission_date, created_at, updated_at,
    teamApprovals
  ];

  db.query(query, values, (err, result) => {
    if (err) return cb(err, null);
    cb(null, { id: result.insertId, property_id });
  });
};

const getAllProperties = (cb) => {
  db.query("SELECT * FROM properties", cb);
};

const getAllPropertiesWithRejected = (cb) => {
  db.query("SELECT * FROM properties", cb);
};

const getPropertyByStage = (stage, cb) => {
  db.query("SELECT * FROM properties WHERE current_phase = ?", [stage], cb);
};
const getPropertyByStatus = (status, cb) => {
  db.query("SELECT * FROM properties WHERE status = ?", [status], cb);
};
const getPropertyById = (id, cb) => {
  db.query("SELECT * FROM properties WHERE id = ?", [id], cb);
};

const updatePropertyStatus = (id, newStatus, cb) => {
  db.query("UPDATE properties SET status = ? WHERE id = ?", [newStatus, id], cb);
};

const trashProperty = (id, team, cb) => {
  db.query(
    "UPDATE properties SET status = 'Rejected', rejected_by = ? WHERE id = ?",
    [team, id],
    cb
  );
};

const undoRejection = (id, teamApprovals, newStatus, cb) => {
  db.query(
    "UPDATE properties SET status = ?, team_approvals = ?, rejected_by = NULL, rejected = 0 WHERE id = ?",
    [newStatus, JSON.stringify(teamApprovals), id],
    cb
  );
};

module.exports = {
  insertProperty,
  getAllProperties,
  getAllPropertiesWithRejected,
  getPropertyByStage,
  getPropertyByStatus,
  getPropertyById,
  updatePropertyStatus,
  trashProperty,
  undoRejection,
};
