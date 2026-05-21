const searchObject = (
  obj,
  fieldName,
  currentPath = ""
) => {
  let result = null;

  const recursiveSearch = (
    current,
    path
  ) => {
    if (
      current === null ||
      current === undefined
    ) {
      return;
    }

    // ARRAY
    if (Array.isArray(current)) {
      current.forEach(
        (item, index) => {
          recursiveSearch(
            item,
            `${path}[${index}]`
          );
        }
      );

      return;
    }

    // OBJECT
    if (
      typeof current === "object"
    ) {
      Object.keys(current).forEach(
        (key) => {
          const value = current[key];

          const cleanKey =
            key.includes(":")
              ? key.split(":")[1]
              : key;

          const newPath = path
            ? `${path}.${cleanKey}`
            : cleanKey;

          // DIRECT FIELD MATCH
         if (
  !result &&
  cleanKey.toLowerCase() ===
    fieldName.toLowerCase()
) {
  result = {
    found: true,
    value,
    path: newPath,
  };

  return;
}

          // NAME/VALUE PAIR MATCH
          if (
  !result &&
  current.name &&
  current.value &&
  String(current.name).toLowerCase() ===
    fieldName.toLowerCase()
){
            result = {
              found: true,
              value:
                current.value,
              path:
                path +
                ".value",
            };
          }

          recursiveSearch(
            value,
            newPath
          );
        }
      );
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

  // XML VALUE
  if (
    typeof value === "object"
  ) {
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
    const clientField =
      mapping.ClientField?.trim();

    const appField =
      mapping.AppField?.trim();

    const match = searchObject(
      data,
      clientField
    );

    results.push({
      appField,
      clientField,
      presentInApi: match
        ? "Yes"
        : "No",
      status: match
        ? "Found"
        : "Missing",
      value: match
        ? formatValue(
            match.value
          )
        : "-",
      actualPath: match
        ? match.path
        : "-",
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