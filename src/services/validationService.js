import { validateJsonWithExcel } from "../utils/validator";

export const runValidation = (
  json,
  headers
) => {
  return validateJsonWithExcel(
    json,
    headers
  );
};