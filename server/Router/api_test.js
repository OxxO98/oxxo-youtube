import express from "express";
const router = express.Router();

router.get("/health", (req, res) => {

  console.log("test for health")
  
  res.send({
    data : {},
    message : "success"
  });
});

export default router;
