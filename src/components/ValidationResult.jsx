function resolvePath(obj, path) {
  if (!path || path === "NA") return undefined;

  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .reduce((acc, key) => {
      if (acc && acc[key] !== undefined) {
        return acc[key];
      }
      return undefined;
    }, obj);
}

function getValue(obj, keys) {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }
  return "";
}

export function validateMappings(data, mappings) {
  const results = [];

  const source = Array.isArray(data) ? data[0] : data;

  let matchedFields = 0;
  let missingFields = 0;
  let mandatoryFields = 0;
  let missingMandatoryFields = 0;

  mappings.forEach((mapping) => {
    const appField = getValue(mapping, ["App Field", "AppField"]);
    const clientField = getValue(mapping, ["Client Field", "ClientField"]);

    const required =
      String(getValue(mapping, ["Required"]))
        .trim()
        .toLowerCase() === "yes";

    if (required) mandatoryFields++;

    const rawMaxLength = String(getValue(mapping, ["Max Length"]))
      .trim()
      .toUpperCase();

    const maxLength =
      rawMaxLength === "" || rawMaxLength === "NA"
        ? null
        : Number(rawMaxLength);

    const value = resolvePath(source, clientField);

    const found = value !== undefined && value !== null && value !== "";

    let status = "Found";

    if (!found) {
      missingFields++;
      status = "Missing";

      if (required) missingMandatoryFields++;
    } else if (maxLength !== null && String(value).length > maxLength) {
      status = "Length Exceeded";
    } else {
      matchedFields++;
    }

    results.push({
      appField,
      clientField,
      required,
      maxLength,
      value: found ? value : "-",
      actualPath: found ? clientField : "-",
      status,
    });
  });

  return {
    results,
    totalFields: mappings.length,
    matchedFields,
    missingFields,
    mandatoryFields,
    optionalFields: mappings.length - mandatoryFields,
    missingMandatoryFields,
    isValid: missingFields === 0,
  };
}