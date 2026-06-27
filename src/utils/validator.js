const searchObject = (
  obj,
  fieldName,
  currentPath = ""
) => {
  // SAFETY CHECK
  if (!fieldName || fieldName === "NA") {
    return null;
  }

  let result = null;

  const searchField = String(fieldName)
    .trim()
    .toLowerCase();

  const recursiveSearch = (current, path) => {
    if (
      current === null ||
      current === undefined ||
      result
    ) {
      return;
    }

    // ARRAY
    if (Array.isArray(current)) {
      current.forEach((item, index) => {
        recursiveSearch(
          item,
          `${path}[${index}]`
        );
      });

      return;
    }

    // OBJECT
    if (typeof current === "object") {
      Object.keys(current).forEach((key) => {
        if (result) return;

        const value = current[key];

        const cleanKey = String(
          key.includes(":")
            ? key.split(":")[1]
            : key
        ).trim();

        const newPath = path
          ? `${path}.${cleanKey}`
          : cleanKey;

        // DIRECT MATCH
        if (
          cleanKey.toLowerCase() === searchField
        ) {
          result = {
            found: true,
            value,
            path: newPath,
          };

          return;
        }

        // XML name/value pair support
        if (
          current.name &&
          current.value &&
          String(current.name)
            .trim()
            .toLowerCase() === searchField
        ) {
          result = {
            found: true,
            value: current.value,
            path: `${path}.value`,
          };

          return;
        }

        recursiveSearch(value, newPath);
      });
    }
  };

  recursiveSearch(obj, currentPath);

  return result;
};

const formatValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  if (typeof value === "object") {
    if (value["#text"]) {
      return value["#text"];
    }

    return JSON.stringify(value);
  }

  return String(value);
};

export const validateMappings = (
  data,
  mappingData
) => {
  const results = [];

  mappingData.forEach((mapping) => {
    // SUPPORT BOTH HEADER FORMATS
    const appField = (
      mapping.AppField ||
      mapping["App Field"] ||
      ""
    ).trim();

    const clientField = (
      mapping.ClientField ||
      mapping["Client Field"] ||
      ""
    ).trim();

    // REQUIRED
    const required =
      String(
        mapping.Required || ""
      )
        .trim()
        .toLowerCase() === "yes";

    // MAX LENGTH
    const rawMaxLength = String(
      mapping["Max Length"] || ""
    )
      .trim()
      .toUpperCase();

    const maxLength =
      rawMaxLength &&
        rawMaxLength !== "NA"
        ? Number(rawMaxLength)
        : null;

    const match = searchObject(
      data,
      clientField
    );

    let status = match
      ? "Found"
      : "Missing";

    // LENGTH VALIDATION
    if (
      match &&
      maxLength !== null &&
      String(match.value).length >
      maxLength
    ) {
      status = "Length Exceeded";
    }

    results.push({
      appField,
      required,
      maxLength,
      clientField,

      value: match
        ? formatValue(match.value)
        : "Not Available",

      actualPath: match
        ? match.path
        : "No Mapping",

      status,
    });
  });

  const matchedCount =
    results.filter(
      (x) => x.status === "Found"
    ).length;

  const missingCount =
    results.filter(
      (x) => x.status === "Missing"
    ).length;

  return {
    results,
    summary: {
      totalFields:
        results.length,

      matchedFields:
        matchedCount,

      missingFields:
        missingCount,
    },
  };
};