const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const {
  insertProperty,
  getAllProperties,
  getAllPropertiesWithRejected,
  getPropertyByStage,
  getPropertyById,
  getPropertyByStatus,
  updatePropertyStatus,
} = require('../models/Property');

const stages = [
  'Pending Verification',
  'Shortlisted',
  'Legally Cleared',
  'Purchased',
  'Finance Approved',
  'Tech Approved',
  'Tokenized',
  'Completed',
];

const teamOrder = [
  'Property Team',
  'Legal Team',
  'Purchase Team',
  'Finance Team',
  'Tech Team',
  'Token Team',
  'Admin',
];

const teamStageMap = {
  'Property Team': 'Shortlisted',
  'Legal Team': 'Legally Cleared',
  'Purchase Team': 'Purchased',
  'Finance Team': 'Finance Approved',
  'Tech Team': 'Tech Approved',
  'Token Team': 'Tokenized',
  'Admin': 'Completed',
};

const stageBeforeTeam = {
  'Property Team': 'Pending Verification',
  'Legal Team': 'Shortlisted',
  'Purchase Team': 'Legally Cleared',
  'Finance Team': 'Purchased',
  'Tech Team': 'Finance Approved',
  'Token Team': 'Tech Approved',
  'Admin': 'Tokenized',
};

function normalizeApprovals(rawApprovals) {
  let teamApprovals = {};
  try {
    teamApprovals = rawApprovals
      ? (typeof rawApprovals === 'string' ? JSON.parse(rawApprovals) : rawApprovals)
      : {};
  } catch {
    teamApprovals = {};
  }

  teamOrder.forEach(t => {
    if (!Object.prototype.hasOwnProperty.call(teamApprovals, t)) {
      teamApprovals[t] = 'Pending';
    }
  });

  return teamApprovals;
}

function parseIndianNumber(value) {
  if (!value) return null;
  value = value.toString().toLowerCase().trim();
  if (value.endsWith('lk')) return parseFloat(value) * 100000;
  if (value.endsWith('cr')) return parseFloat(value) * 10000000;
  return parseFloat(value);
}


exports.submitProperty = async (req, res) => {
  try {
    const requiredFields = [
      'submitted_by','agent_name','agent_code','agent_phone',
      'state','city','street','pincode','entrance_direction',
      'owner_name','owner_email','owner_mobile','location','category',
      'property_size','dimensions','ownership_type','sale_type',
      'approval_type','address','entrance_facing','seller_price',
      'neighbourhood_pricing',
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) return res.status(400).json({ msg: `${field} is required.` });
    }

    req.body.seller_price = parseIndianNumber(req.body.seller_price);
    req.body.neighbourhood_pricing = parseIndianNumber(req.body.neighbourhood_pricing);
    req.body.asking_price = parseIndianNumber(req.body.asking_price);
    req.body.final_price = parseIndianNumber(req.body.final_price);
    req.body.team_approvals = {};
    teamOrder.forEach(t => req.body.team_approvals[t] = 'Pending');
    req.body.rejected = 0;
    req.body.rejected_by = null;
    req.body.status = 'Pending Verification';
    
    req.body.title_deed = null;
    req.body.patta_chitta = null;
    req.body.ec = null;
    req.body.parental_doc = null;
    req.body.power_of_attorney = null;
    req.body.land_tax_receipt = null;
    req.body.street_view = null;
    req.body.entrance_view = null;
    req.body.inside_view = null;
    req.body.drone_view = null;

    insertProperty(req.body, async (err, result) => {
      if (err) {
        console.error('❌ Property insert error:', err);
        return res.status(500).json({ msg: 'Property submission failed.' });
      }

      const propertyId = result.id;
      
      if (req.files && Object.keys(req.files).length > 0) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        try {
          const allFiles = [];
          const filePaths = {}; // store final names for DB update

          const optionalDocs = ['title_deed','patta_chitta','ec','parental_doc','power_of_attorney','land_tax_receipt'];
          for (const doc of optionalDocs) {
            if (req.files[doc]) {
              const file = req.files[doc];
              const uniqueName = `${propertyId}_${Date.now()}_${doc}_${file.name}`;
              const filePath = path.join(uploadDir, uniqueName);
              filePaths[doc] = uniqueName;
              allFiles.push(file.mv(filePath));
            }
          }

          if (req.files.documents) {
            const generalDocs = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
            generalDocs.forEach((file, idx) => {
              const uniqueName = `${propertyId}_${Date.now()}_doc${idx}_${file.name}`;
              const filePath = path.join(uploadDir, uniqueName);
              allFiles.push(file.mv(filePath));
            });
          }

          const photoFields = ['street','entrance','inside','drone'];
          for (const photo of photoFields) {
            if (req.files[`photo_${photo}`]) {
              const file = req.files[`photo_${photo}`];
              const uniqueName = `${propertyId}_${Date.now()}_photo_${photo}_${file.name}`;
              const filePath = path.join(uploadDir, uniqueName);
              filePaths[`photo_${photo}`] = uniqueName;
              allFiles.push(file.mv(filePath));
            }
          }

          if (allFiles.length > 0) {
            await Promise.all(allFiles);
            db.query(
              `UPDATE properties 
               SET title_deed = ?, patta_chitta = ?, ec = ?, parental_doc = ?, power_of_attorney = ?, land_tax_receipt = ?,
                   street_view = ?, entrance_view = ?, inside_view = ?, drone_view = ?
               WHERE id = ?`,
              [
                filePaths['title_deed'] || null,
                filePaths['patta_chitta'] || null,
                filePaths['ec'] || null,
                filePaths['parental_doc'] || null,
                filePaths['power_of_attorney'] || null,
                filePaths['land_tax_receipt'] || null,
                filePaths['photo_street'] || null,
                filePaths['photo_entrance'] || null,
                filePaths['photo_inside'] || null,
                filePaths['photo_drone'] || null,
                propertyId
              ],
              (updErr) => {
                if (updErr) {
                  console.error('❌ Error updating file paths in DB:', updErr);
                  return res.status(500).json({ msg: 'Property saved but file paths not stored.' });
                }
                res.status(201).json({ 
                  msg: 'Property submitted successfully with files.', 
                  property_id: propertyId 
                });
              }
            );
          } else {
             res.status(201).json({ 
              msg: 'Property submitted successfully.', 
              property_id: propertyId 
            });
          }
        } catch (uploadErr) {
          console.error('❌ File upload error:', uploadErr);
          return res.status(500).json({ msg: 'Error during file upload.' });
        }
      } else {
        res.status(201).json({ 
          msg: 'Property submitted successfully.', 
          property_id: propertyId 
        });
      }
    });
  } catch (error) {
    console.error('❌ General Error:', error);
    return res.status(500).json({ msg: 'Internal server error.' });
  }
};

exports.uploadDocuments = (req, res) => {
  const files = req.files?.documents;
  const propertyId = req.params.id;  
  const uploads = Array.isArray(files) ? files : [files];
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

  try {
    uploads.forEach((file, index) => {
      const uniqueName = `${dbId}_${Date.now()}_${index}_${file.name}`;
      const filePath = path.join(uploadDir, uniqueName);
      file.mv(filePath, (err) => { if (err) throw err; });
    });
    res.json({ msg: 'Files uploaded successfully.' });
  } catch (error) {
    console.error('❌ Document upload error:', error);
    res.status(500).json({ msg: 'File upload failed.' });
  }
};

exports.getAll = (req, res) => {
  const requestingTeam = req.query.team;
  getAllProperties((err, results) => {
    if (err) return res.status(500).json({ msg: 'Failed to fetch properties.' });

    const updatedResults = results.map(property => {
      const teamApprovals = normalizeApprovals(property.team_approvals);
      return { ...property, team_approvals: teamApprovals };
    });

    const visibleProperties = !requestingTeam || requestingTeam === 'Admin'
      ? updatedResults
      : updatedResults.filter(property => {
          const nextTeam = teamOrder.find(t => property.team_approvals[t] === 'Pending');
          return nextTeam === requestingTeam;
        });

    res.json(visibleProperties);
  });
};

exports.getAllWithRejected = (req, res) => {
  getAllPropertiesWithRejected((err, results) => {
    if (err) return res.status(500).json({ msg: 'Failed to fetch properties.' });
    res.json(results);
  });
};

exports.getByStage = (req, res) => {
  getPropertyByStage(req.params.stage, (err, results) => {
    if (err) return res.status(500).json({ msg: 'Failed to fetch by stage.' });
    res.json(results);
  });
};

exports.getByStatus = (req, res) => {
  getPropertyByStatus(req.params.status, (err, results) => {
    if (err) return res.status(500).json({ msg: 'Failed to fetch properties by status.' });
    res.json(results);
  });
};

exports.getOne = (req, res) => {
  getPropertyById(req.params.id, (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ msg: 'Property not found.' });
    const property = results[0];
    const teamApprovals = normalizeApprovals(property.team_approvals);
    res.json({ ...property, team_approvals: teamApprovals });
  });
};

exports.updateStatus = (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ msg: 'Status is required.' });

  updatePropertyStatus(req.params.id, status, (err, result) => {
    if (err) return res.status(500).json({ msg: 'Failed to update status.' });
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Property not found.' });
    res.json({ msg: 'Status updated successfully.' });
  });
};

exports.advanceStage = (req, res) => {
  const { direction, team } = req.body;
  getPropertyById(req.params.id, (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ msg: 'Property not found.' });

    const property = results[0];
    let teamApprovals = normalizeApprovals(property.team_approvals);

    if (team) {
      const nextPendingTeam = teamOrder.find(t => teamApprovals[t] === 'Pending');
      if (nextPendingTeam !== team) return res.status(400).json({ msg: `Cannot approve yet. Next: ${nextPendingTeam}` });
      teamApprovals[team] = 'Approved';
      const newStatus = teamStageMap[team] || property.status;
      db.query('UPDATE properties SET status = ?, team_approvals = ? WHERE id = ?', [newStatus, JSON.stringify(teamApprovals), req.params.id], (updErr) => {
        if (updErr) return res.status(500).json({ msg: 'Stage update failed.' });
        res.json({ msg: `Team '${team}' approved. Status: '${newStatus}'`, team_approvals: teamApprovals, newStatus });
      });
      return;
    }

    let idx = stages.indexOf(property.status);
    if (idx === -1) idx = 0;
    
    if (direction === 'next') {
      idx = Math.min(idx + 1, stages.length - 1);
    } else {
      idx = Math.max(idx - 1, 0);
    }
    
    const newStatus = stages[idx];
    
    teamOrder.forEach(t => {
      const teamStage = teamStageMap[t];
      const teamStageIndex = stages.indexOf(teamStage);
      if (teamStageIndex !== -1 && teamStageIndex <= idx) {
        teamApprovals[t] = 'Approved';
      } else {
        teamApprovals[t] = 'Pending';
      }
    });

    db.query('UPDATE properties SET status = ?, team_approvals = ? WHERE id = ?', [newStatus, JSON.stringify(teamApprovals), req.params.id], (updErr) => {
      if (updErr) return res.status(500).json({ msg: 'Stage update failed.' });
        res.json({ msg: `Stage moved to '${newStatus}'`, team_approvals: teamApprovals, newStatus });
    });
  });
};

exports.approveAndAdvance = (req, res) => {
  const propertyId = req.params.id;
  const team = req.user?.team || req.body.team;
  if (!team) return res.status(403).json({ msg: 'Team not specified.' });

  db.query('SELECT * FROM properties WHERE id = ?', [propertyId], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error' });
    if (results.length === 0) return res.status(404).json({ msg: 'Property not found' });

    const property = results[0];
    let teamApprovals = normalizeApprovals(property.team_approvals);

    const nextPendingTeam = teamOrder.find(t => teamApprovals[t] === 'Pending');
    if (nextPendingTeam !== team) return res.status(403).json({ msg: `It's not ${team}'s turn.` });

    teamApprovals[team] = 'Approved';
    const newStatus = teamStageMap[team] || property.status;

    db.query('UPDATE properties SET status = ?, team_approvals = ? WHERE id = ?', [newStatus, JSON.stringify(teamApprovals), propertyId], (updErr) => {
      if (updErr) return res.status(500).json({ msg: 'Failed to advance stage' });
      res.json({ msg: `Team '${team}' approved. Status: '${newStatus}'`, team_approvals: teamApprovals, newStatus });
    });
  });
};

exports.undoRejection = (req, res) => {
  const propertyId = req.params.id;

  db.query('SELECT * FROM properties WHERE id = ?', [propertyId], (err, results) => {
    if (err) {
      console.error('DB fetch error (undoRejection):', err);
      return res.status(500).json({ msg: 'Error fetching property.' });
    }
    if (results.length === 0) return res.status(404).json({ msg: 'Property not found.' });

    const property = results[0];
    let teamApprovals = normalizeApprovals(property.team_approvals);

    if (!property.rejected || !property.rejected_by) {
      return res.status(400).json({ msg: 'Property is not rejected.' });
    }

    const rejectingTeam = property.rejected_by;
    const rejectingIndex = teamOrder.indexOf(rejectingTeam);
    if (rejectingIndex === -1) {
      return res.status(400).json({ msg: `Unknown rejecting team: ${rejectingTeam}` });
    }

    let newStatus = 'Pending Verification';
    for (let i = rejectingIndex - 1; i >= 0; i--) {
      const team = teamOrder[i];
      if (teamApprovals[team] === 'Approved') {
        newStatus = teamStageMap[team];
        break;
      }
    }

    for (let i = rejectingIndex; i < teamOrder.length; i++) {
      teamApprovals[teamOrder[i]] = 'Pending';
    }

    db.query(
      'UPDATE properties SET status = ?, team_approvals = ?, rejected_by = NULL, rejected = 0 WHERE id = ?',
      [newStatus, JSON.stringify(teamApprovals), propertyId],
      (updErr) => {
        if (updErr) {
          console.error('DB update error (undoRejection):', updErr);
          return res.status(500).json({ msg: 'Error updating property.' });
        }
        console.log(`undoRejection: property ${propertyId} -> status=${newStatus}`, teamApprovals);
        res.json({
          msg: `Rejection undone. Back to ${newStatus}`,
          status: newStatus,
          team_approvals: teamApprovals
        });
      }
    );
  });
};

exports.trashProperty = (req, res) => {
  const propertyId = req.params.id;
  const { team } = req.body;

  db.query('SELECT team_approvals FROM properties WHERE id = ?', [propertyId], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Error fetching property.' });
    if (results.length === 0) return res.status(404).json({ msg: 'Property not found.' });

    let teamApprovals = normalizeApprovals(results[0].team_approvals);

    const rejectingTeam = team || teamOrder.find(t => teamApprovals[t] === 'Pending');
    if (!rejectingTeam) return res.status(400).json({ msg: 'No valid rejecting team.' });

    teamApprovals[rejectingTeam] = 'Rejected';
    db.query('UPDATE properties SET status = "Rejected", rejected = 1, rejected_by = ?, team_approvals = ? WHERE id = ?', 
      [rejectingTeam, JSON.stringify(teamApprovals), propertyId], 
      (updErr) => {
        if (updErr) return res.status(500).json({ msg: 'Error rejecting property.' });
        res.json({ msg: `Property rejected by ${rejectingTeam}`, team_approvals: teamApprovals });
      });
  });
};

exports.deletePermanently = (req, res) => {
  const propertyId = req.params.id;
  const uploadDir = path.join(__dirname, '..', 'uploads');

  fs.readdir(uploadDir, async (err, files) => {
    if (err) return res.status(500).json({ msg: 'Failed to read upload directory.' });

    const matchedFiles = files.filter(f => f.startsWith(`${propertyId}_`));
    await Promise.all(matchedFiles.map(f => fs.promises.unlink(path.join(uploadDir, f)).catch(() => {})));

    db.query('DELETE FROM properties WHERE id = ?', [propertyId], (delErr, result) => {
      if (delErr) return res.status(500).json({ msg: 'Failed to delete property.' });
      if (result.affectedRows === 0) return res.status(404).json({ msg: 'Property not found.' });
      res.json({ msg: 'Property and files deleted successfully.' });
    });
  });
};

exports.repairPropertyApprovals = (req, res) => {
  const propertyId = req.params.id;
  
  db.query('SELECT * FROM properties WHERE id = ?', [propertyId], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Error fetching property.' });
    if (results.length === 0) return res.status(404).json({ msg: 'Property not found.' });
    
    const property = results[0];
    let teamApprovals = normalizeApprovals(property.team_approvals);
    
    if (property.status === 'Shortlisted' && teamApprovals['Property Team'] !== 'Approved') {
      teamApprovals['Property Team'] = 'Approved';
    }
    
    const statusIndex = stages.indexOf(property.status);
    teamOrder.forEach((team, index) => {
      const teamStage = teamStageMap[team];
      const teamStageIndex = stages.indexOf(teamStage);
      
      if (teamStageIndex !== -1) {
        if (teamStageIndex <= statusIndex) {
          teamApprovals[team] = 'Approved';
        } else {
          teamApprovals[team] = 'Pending';
        }
      }
    });
    
    db.query(
      'UPDATE properties SET team_approvals = ? WHERE id = ?',
      [JSON.stringify(teamApprovals), propertyId],
      (updErr) => {
        if (updErr) return res.status(500).json({ msg: 'Error repairing property.' });
        res.json({ msg: 'Property approvals repaired successfully.', team_approvals: teamApprovals });
      }
    );
  });
};

exports.repairAllProperties = (req, res) => {
  getAllProperties((err, results) => {
    if (err) return res.status(500).json({ msg: 'Failed to fetch properties.' });
    
    let repairedCount = 0;
    let errors = [];
    
    const processProperty = (index) => {
      if (index >= results.length) {
        return res.json({ 
          msg: `Repair process completed. ${repairedCount} properties repaired.`,
          errors: errors,
          repaired_count: repairedCount
        });
      }
      
      const property = results[index];
      let teamApprovals = normalizeApprovals(property.team_approvals);
      let needsRepair = false;
      
      if (property.status === 'Shortlisted' && teamApprovals['Property Team'] !== 'Approved') {
        teamApprovals['Property Team'] = 'Approved';
        needsRepair = true;
      }
      
      const statusIndex = stages.indexOf(property.status);
      teamOrder.forEach((team) => {
        const teamStage = teamStageMap[team];
        const teamStageIndex = stages.indexOf(teamStage);
        
        if (teamStageIndex !== -1) {
          const shouldBeApproved = teamStageIndex <= statusIndex;
          if (shouldBeApproved && teamApprovals[team] !== 'Approved') {
            teamApprovals[team] = 'Approved';
            needsRepair = true;
          } else if (!shouldBeApproved && teamApprovals[team] !== 'Pending') {
            teamApprovals[team] = 'Pending';
            needsRepair = true;
          }
        }
      });
      
      if (needsRepair) {
        db.query(
          'UPDATE properties SET team_approvals = ? WHERE id = ?',
          [JSON.stringify(teamApprovals), property.id],
          (updErr) => {
            if (updErr) {
              errors.push(`Property ${property.id}: ${updErr.message}`);
            } else {
              repairedCount++;
            }
            processProperty(index + 1);
          }
        );
      } else {
        processProperty(index + 1);
      }
    };
    
    processProperty(0);
  });
};
