
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/authController");
const {
  createRequest,
  updateRequest,
  deleteRequest,
  getRequests,
  assignPersonnel,
  listAllRequests,
  listPresidentApprovedRequests,
  deleteAllRequests
} = require("../controllers/requestController");

// BULK DELETE ALL REQUESTS (Admin only)
router.delete("/requests", verifyToken, deleteAllRequests);

   // TEMPORARY: List all requests for debugging
   router.get("/requests/all-debug", listAllRequests);

   // Filtered: Only requests approved by President
   router.get("/requests/president-approved", listPresidentApprovedRequests);

   // CREATE REQUEST
   router.post("/requests", verifyToken, (req, res, next) => {
     // Add debug logging for DB errors
     const createRequest = require("../controllers/requestController").createRequest;
     // Wrap the original handler to add error logging
     function wrappedCreateRequest(req, res) {
       const originalResStatus = res.status;
       res.status = function(code) {
         if (code === 500) {
           // Log error details if present
           if (arguments[1] && arguments[1].error) {
             console.error("DB error in createRequest:", arguments[1].error);
           }
         }
         return originalResStatus.apply(this, arguments);
       };
       return createRequest(req, res);
     }
     wrappedCreateRequest(req, res);
   });

   // READ (Admin or user) - Protected
   router.get("/requests", verifyToken, getRequests);

   // UPDATE - Protected
   router.put("/requests/:id", verifyToken, updateRequest);

   // PRESIDENT DECISION - Protected
   router.put("/requests/:id/president", verifyToken, require("../controllers/requestController").setPresidentDecision);

   // ASSIGN PERSONNEL - Protected
   router.post("/requests/:id/assign", verifyToken, assignPersonnel);

   // DELETE - Protected
   router.delete("/requests/:id", verifyToken, deleteRequest);

  // Get distinct urgency options
  const db = require("../db");
  router.get("/requests/urgency-options", (req, res) => {
    db.query("SELECT DISTINCT urgency FROM requests", (err, results) => {
      if (err) return res.status(500).json([]);
      res.json(results.map(r => r.urgency));
    });
  });

  module.exports = router;
