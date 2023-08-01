import express from "express";
import isAuth from "../middleware/isAuth";
import * as ReportsController from "../controllers/ReportsController";

const reportRoutes = express.Router();

reportRoutes.get("/reports/nps_for_all_user", isAuth, ReportsController.notesNpsByUsers);

export default reportRoutes;
