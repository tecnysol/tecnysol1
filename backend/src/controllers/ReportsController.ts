import { Request, Response } from "express";
import NotesNpsByUsersService from "../services/ReportsService/NotesNpsByUsersService";

export const notesNpsByUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { startDate, endDate, selectedContact, selectedAtendente, noteType } = req.query;

  const data = await NotesNpsByUsersService({companyId, startDate, endDate, selectedContact, selectedUser: selectedAtendente, noteType});

  return res.status(200).json(data);
}
