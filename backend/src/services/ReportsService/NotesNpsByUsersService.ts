import { QueryTypes } from "sequelize";
import * as _ from "lodash";
import sequelize from "../../database";

export default async function NotesNpsByUsersService({
  companyId,
  startDate,
  endDate,
  selectedContact,
  selectedUser,
  noteType,
}
) {

  let type = '';
  if (noteType === 'detratores') {
    type = "<= '2'";
  } else if (noteType === 'neutros') {
    type = "= '3'";
  } else if (noteType === 'promotores') {
    type = ">= '4'";
  }

  const strQuerySelectedContact = selectedContact ? `AND "Contacts".id = ${selectedContact}` : '';
  const strQuerySelectedUser = selectedUser ? `AND "Users".id = ${selectedUser}` : '';
  const strQueryNoteType = noteType !== 'todas' ? `AND "UserRatings".rate ${type}` : '';
  console.log('PAQUI =============================');

  const data = await sequelize.query(
    `
    SELECT "Tickets".id, "Tickets".uuid, "Contacts".name AS contactname, "Contacts".id AS contactid, "UserRatings".rate AS note, "UserRatings"."createdAt" AS "createdAt",
    "Users".name AS "user"
    FROM "UserRatings"
    INNER JOIN "Tickets" ON ("Tickets".id = "UserRatings"."ticketId")
    INNER JOIN "Contacts" ON ("Tickets"."contactId" = "Contacts".id)
    INNER JOIN "Users" ON ("Users".id = "UserRatings"."userId")
      WHERE "UserRatings"."companyId" = :companyId AND CAST("UserRatings"."createdAt" AS DATE) >= :startDate AND CAST("UserRatings"."createdAt" AS DATE) <= :endDate
      ${strQuerySelectedContact}
      ${strQuerySelectedUser}
      ${strQueryNoteType}
      order by "UserRatings"."createdAt" DESC
    `,
    {
      replacements: {
        companyId,
        startDate,
        endDate
      },
      type: QueryTypes.SELECT,
      logging: true
    }
  );

  return data;
}
