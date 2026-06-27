import { useState } from "react";

import ExcelUploader from "./components/ExcelUploader";
import JsonInput from "./components/JsonInput";
import { parseXmlToJson } from "./utils/xmlParser";
import { validateMappings } from "./utils/validator";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function App() {
  const [jsonText, setJsonText] = useState("");
  const [mappings, setMappings] = useState([]);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);

  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const [filters, setFilters] = useState({
    appField: "",
    clientField: "",
    actualPath: "",
    value: "",
    status: "",
  });

  // -------------------------
  // SAFE TEXT HELPER
  // -------------------------
  const safeText = (v) => String(v ?? "").toLowerCase();

  // -------------------------
  // VALIDATE
  // -------------------------
  const handleValidate = () => {
    try {
      if (!jsonText.trim()) {
        alert("Please enter JSON or XML");
        return;
      }

      let parsedData;
      const trimmedText = jsonText.trim();

      if (trimmedText.startsWith("<?xml") || trimmedText.startsWith("<")) {
        parsedData = parseXmlToJson(trimmedText);
      } else {
        parsedData = JSON.parse(trimmedText);

        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
        }
      }

      const validationResponse = validateMappings(parsedData, mappings);

      setResults(validationResponse.results);
      setSummary(validationResponse.summary);
    } catch (error) {
      console.error(error);
      alert("Invalid JSON/XML format");
    }
  };

  // -------------------------
  // EXPORT EXCEL
  // -------------------------
  const exportToExcel = () => {
    if (!results.length) {
      alert("No validation results found");
      return;
    }

    const exportData = results.map((item) => ({
      "App Field": item.appField,
      "Required": item.required ? "Required" : "Optional",
      "Max Length": item.maxLength ?? "No Limit",
      "Client Field": item.clientField,
      "JSON/XML Path": item.actualPath,
      "Value":
        typeof item.value === "object"
          ? JSON.stringify(item.value)
          : item.value,
      "Status": item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Validation Result"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, `Validation_Result_${Date.now()}.xlsx`);
  };

  // -------------------------
  // SORT
  // -------------------------
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // -------------------------
  // FILTER + SORT (FIXED)
  // -------------------------
  const filteredResults = results
    .filter((item) => {
      return (
        safeText(item.appField).includes(safeText(filters.appField)) &&
        safeText(item.clientField).includes(safeText(filters.clientField)) &&
        safeText(item.actualPath).includes(safeText(filters.actualPath)) &&
        safeText(item.value).includes(safeText(filters.value)) &&
        safeText(item.status).includes(safeText(filters.status))
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      const aValue = safeText(a?.[sortField]);
      const bValue = safeText(b?.[sortField]);

      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                API Field Validator
              </h1>
              <p className="text-gray-500 mt-2">
                Validate API response fields against app mappings
              </p>
            </div>

            <div className="bg-gray-100 text-gray-700 px-5 py-3 rounded-2xl font-medium">
              Tex.tracer Enterprise Mapping
            </div>
          </div>

          {/* TOP SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-5">
                Upload Excel Mapping
              </h2>

              <ExcelUploader setMappings={setMappings} />

              <div className="mt-6">
                <p className="text-gray-500 text-sm">
                  Total Mapping Fields
                </p>
                <h3 className="text-4xl font-bold text-gray-800 mt-2">
                  {mappings.length}
                </h3>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-5">
                Paste Client API JSON/XML Response
              </h2>

              <JsonInput jsonText={jsonText} setJsonText={setJsonText} />
            </div>
          </div>

          {/* BUTTON */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleValidate}
              className="bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-semibold"
            >
              Validate Response
            </button>
          </div>

          {/* SUMMARY */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

              <div className="bg-white border rounded-3xl p-6">
                <h3 className="text-sm text-gray-500">Total Fields</h3>
                <p className="text-4xl font-bold">{summary.totalFields}</p>
              </div>

              <div className="bg-white border border-green-100 rounded-3xl p-6">
                <h3 className="text-sm text-gray-500">Matched Fields</h3>
                <p className="text-4xl font-bold text-green-600">
                  {summary.matchedFields}
                </p>
              </div>

              <div className="bg-white border border-red-100 rounded-3xl p-6">
                <h3 className="text-sm text-gray-500">Missing Fields</h3>
                <p className="text-4xl font-bold text-red-500">
                  {summary.missingFields}
                </p>
              </div>
            </div>
          )}

          {/* TABLE */}
          {results.length > 0 && (
            <div className="mt-10 bg-white border rounded-3xl overflow-hidden">

              <div className="px-6 py-5 border-b bg-gray-50 flex justify-between">
                <h2 className="text-2xl font-bold">
                  Validation Result
                </h2>

                <button
                  onClick={exportToExcel}
                  className="bg-gray-900 text-white px-5 py-3 rounded-2xl"
                >
                  Download Excel
                </button>
              </div>

              <table className="w-full table-fixed">

                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      { label: "App Field", field: "appField" },
                      { label: "Required", field: "required" },
                      { label: "Max Length", field: "maxLength" },
                      { label: "Client Field", field: "clientField" },
                      { label: "JSON Path", field: "actualPath" },
                      { label: "Value", field: "value" },
                      { label: "Status", field: "status" },
                    ].map((col) => (
                      <th
                        key={col.field}
                        onClick={() => handleSort(col.field)}
                        className="px-6 py-4 text-left font-semibold cursor-pointer"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredResults.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">

                      <td className="px-5 py-5 font-semibold">
                        {item.appField}
                      </td>

                      <td className="px-5 py-5">
                        {item.required ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-50 text-slate-600 border border-slate-200">
                            Optional
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {item.maxLength ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {item.maxLength}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            No Limit
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {item.clientField}
                      </td>

                      <td className="px-5 py-5 text-blue-600 break-all">
                        {item.actualPath}
                      </td>

                      <td className="px-5 py-5 break-all">
                        <div className="text-gray-700">
                          {item.value === "-" ||
                            item.value === "Not Available" ? (
                            <span className="text-slate-400 italic">
                              Not Available
                            </span>
                          ) : (
                            String(item.value)
                          )}
                        </div>

                        {item.status === "Found" && item.maxLength && (
                          <span className="inline-flex mt-2 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Within Limit
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {item.status === "Found" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Found
                          </span>
                        )}

                        {item.status === "Missing" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            Missing
                          </span>
                        )}

                        {item.status === "Length Exceeded" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
                            Length Exceeded
                          </span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}