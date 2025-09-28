// repositories/CmpDormanClientControlRepository.js
import CmpDormanClientControlModel from "../models/CmpDormanClientControlModel.js";

export default {
  findAll(
    where = {},
    order = [
      ["processingYear", "DESC"],
      ["lastProcessedMonth", "DESC"],
    ]
  ) {
    return CmpDormanClientControlModel.findAll({
      where,
      order,
    });
  },
};
