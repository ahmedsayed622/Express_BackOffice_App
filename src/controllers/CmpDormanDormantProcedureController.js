// controllers/CmpDormanDormantProcedureController.js
import { asyncWrapper } from "../utils/asyncWrapper.js";
import CmpDormanDormantProcedureService from "../services/CmpDormanDormantProcedureService.js";

export const run = asyncWrapper(async (req, res) => {
  const timeoutSeconds =
    Number(req.query.timeout ?? req.body?.timeout ?? 0) || 0;
  const result = await CmpDormanDormantProcedureService.execute({
    timeoutSeconds,
  });
  return res.status(200).json(result); // { success, status:'COMPLETED', code:'OK', message:... }
});
