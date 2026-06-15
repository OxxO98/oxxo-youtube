import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

router.get("/health", (req : RouterRequest, res : RouterResponse) => {

  console.log("test for health")
  
  res.send({
    data : {},
    message : "success"
  });
});

export default router;
