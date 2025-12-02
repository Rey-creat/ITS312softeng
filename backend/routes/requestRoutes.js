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
   } = require("../controllers/requestController");

   // TEMPORARY: List all requests for debugging
   router.get("/requests/all-debug", listAllRequests);

   // Filtered: Only requests approved by President
   router.get("/requests/president-approved", listPresidentApprovedRequests);

   // CREATE - Protected
   router.post("/requests", verifyToken, createRequest);

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

   module.exports = router;
   