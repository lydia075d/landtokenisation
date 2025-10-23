const express = require('express');
const fileUpload = require('express-fileupload');
const {
  submitProperty,
  getAll,
  getAllWithRejected,
  getByStage,
  getByStatus,
  getOne,              
  advanceStage,
  uploadDocuments,
  updateStatus,
  trashProperty,
  undoRejection,
  deletePermanently,
  approveAndAdvance,
} = require('../controllers/propertyController');

const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

const router = express.Router();

  
 router.post('/submit', submitProperty);
router.get('/', getAll);
router.get('/all', getAll);  
router.get('/all-with-rejected', getAllWithRejected);

router.get('/stage/:stage', getByStage);
router.get('/status/:status', getByStatus);

router.get("/:id/download", (req, res) => {
  const propertyId = req.params.id;
  const uploadDir = path.join(__dirname, "../uploads");

  const files = fs.readdirSync(uploadDir).filter(file =>
    file.startsWith(`${propertyId}_`)
  );

  if (!files.length) return res.status(404).json({ msg: "No files found for this property" });

  const zipFileName = `property_${propertyId}_files.zip`;

  res.setHeader("Content-Disposition", `attachment; filename=${zipFileName}`);
  res.setHeader("Content-Type", "application/zip");

  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    console.error("Archive error:", err);
    res.status(500).send({ msg: "Could not create zip file" });
  });

  archive.on("end", () => {
    console.log(`Zip file for property ${propertyId} created successfully`);
  });

  archive.pipe(res);

  files.forEach(file => {
    archive.file(path.join(uploadDir, file), { name: file });
  });

  archive.finalize();
});


router.put('/advance/:id', advanceStage);
router.post('/upload/:id', uploadDocuments);
router.put('/:id/status', updateStatus);

router.put('/:id/trash', trashProperty);
router.put('/:id/undo-rejection', undoRejection);

router.delete('/:id/delete', deletePermanently);
router.delete('/:id', deletePermanently); 

router.post('/approve/:id', approveAndAdvance);
router.get('/:id', getOne);

module.exports = router;
