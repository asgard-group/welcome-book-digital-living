// GET /api/admin-check
//
// Reports whether the current request carries a valid admin session cookie,
// so the Admin page can skip the login form on a return visit.
import { json } from "./_lib/grants";
import { isAdminRequest } from "./_lib/admin";

export default async (req: Request) => {
  const authenticated = await isAdminRequest(req);
  return json(200, { authenticated });
};
