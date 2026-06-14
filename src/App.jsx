import { useState } from "react";

import ExcelUploader from "./components/ExcelUploader";
import JsonInput from "./components/JsonInput";
import { parseXmlToJson } from "./utils/xmlParser";

import { validateMappings } from "./utils/validator";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function App() {
  const [jsonText, setJsonText] =
    useState("");

  const [mappings, setMappings] =
    useState([]);

  const [results, setResults] =
    useState([]);

  const [summary, setSummary] =
    useState(null);

    const [sortField, setSortField] =
  useState("");

const [sortDirection, setSortDirection] =
  useState("asc");

const [filters, setFilters] =
  useState({
    appField: "",
    clientField: "",
    actualPath: "",
    value: "",
    status: "",
  });

const handleValidate = () => {
  try {
    if (!jsonText.trim()) {
      alert(
        "Please enter JSON or XML"
      );

      return;
    }

    let parsedData;

    const trimmedText =
      jsonText.trim();

    // XML
    if (
      trimmedText.startsWith(
        "<?xml"
      ) ||
      trimmedText.startsWith("<")
    ) {
      parsedData =
        parseXmlToJson(
          trimmedText
        );
    }

    // JSON
    else {
      parsedData =
        JSON.parse(trimmedText);

      // SINGLE OBJECT => ARRAY
      if (
        !Array.isArray(
          parsedData
        )
      ) {
        parsedData = [
          parsedData,
        ];
      }
    }

    const validationResponse =
      validateMappings(
        parsedData,
        mappings
      );

    setResults(
      validationResponse.results
    );

    setSummary(
      validationResponse.summary
    );
  } catch (error) {
    console.error(error);

    alert(
      "Invalid JSON/XML format"
    );
  }
};

const exportToExcel = () => {
  if (!results.length) {
    alert("No validation results found");

    return;
  }

  const exportData = results.map(
    (item) => ({
      "App Field":
        item.appField,

      "Client Field":
        item.clientField,

      "JSON/XML Path":
        item.actualPath,

      Value:
        typeof item.value ===
        "object"
          ? JSON.stringify(
              item.value
            )
          : item.value,

      Status:
        item.status,
    })
  );

  const worksheet =
    XLSX.utils.json_to_sheet(
      exportData
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Validation Result"
  );

  const excelBuffer =
    XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

  const blob = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    }
  );

  saveAs(
    blob,
    `Validation_Result_${Date.now()}.xlsx`
  );
};

const handleSort = (field) => {
  if (sortField === field) {
    setSortDirection(
      sortDirection === "asc"
        ? "desc"
        : "asc"
    );
  } else {
    setSortField(field);
    setSortDirection("asc");
  }
};

const filteredResults =
  results
    .filter((item) => {
      return (
        item.appField
          ?.toLowerCase()
          .includes(
            filters.appField.toLowerCase()
          ) &&
        item.clientField
          ?.toLowerCase()
          .includes(
            filters.clientField.toLowerCase()
          ) &&
        item.actualPath
          ?.toLowerCase()
          .includes(
            filters.actualPath.toLowerCase()
          ) &&
        String(item.value)
          ?.toLowerCase()
          .includes(
            filters.value.toLowerCase()
          ) &&
        item.status
          ?.toLowerCase()
          .includes(
            filters.status.toLowerCase()
          )
      );
    })
    .sort((a, b) => {
      if (!sortField)
        return 0;

      const aValue =
        String(
          a[sortField]
        ).toLowerCase();

      const bValue =
        String(
          b[sortField]
        ).toLowerCase();

      if (
        sortDirection === "asc"
      ) {
        return aValue.localeCompare(
          bValue
        );
      }

      return bValue.localeCompare(
        aValue
      );
    });
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
                Validate API response fields
                against app mappings
              </p>
            </div>

            <div className="bg-gray-100 text-gray-700 px-5 py-3 rounded-2xl font-medium">
             Tex.tracer Enterprise Mapping
            </div>
          </div>

          {/* TOP SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* EXCEL */}
            <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-5">
                Upload Excel Mapping
              </h2>

              <ExcelUploader
                setMappings={setMappings}
              />

              <div className="mt-6">
                <p className="text-gray-500 text-sm">
                  Total Mapping Fields
                </p>

                <h3 className="text-4xl font-bold text-gray-800 mt-2">
                  {mappings.length}
                </h3>
              </div>
            </div>

            {/* JSON */}
            <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-5">
                Paste Client API JSON/XML Response
              </h2>

              <JsonInput
                jsonText={jsonText}
                setJsonText={setJsonText}
              />
            </div>
          </div>

          {/* BUTTON */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleValidate}
              className="bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-semibold transition-all shadow-sm"
            >
              Validate Response
            </button>
          </div>

          {/* SUMMARY */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              
              {/* TOTAL */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Total Fields
                    </h3>

                    <p className="text-4xl font-bold text-gray-800 mt-3">
                      {summary.totalFields}
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                    📊
                  </div>
                </div>
              </div>

              {/* MATCHED */}
              <div className="bg-white border border-green-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Matched Fields
                    </h3>

                    <p className="text-4xl font-bold text-green-600 mt-3">
                      {summary.matchedFields}
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
                    ✅
                  </div>
                </div>
              </div>

              {/* MISSING */}
              <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Missing Fields
                    </h3>

                    <p className="text-4xl font-bold text-red-500 mt-3">
                      {summary.missingFields}
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">
                    ⚠️
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABLE */}
          {results.length > 0 && (
            <div className="mt-10 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Validation Result
                </h2>

                <button
                  onClick={exportToExcel}
                  className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-all"
                >
                  ⬇ Download Excel
                </button>
              </div>

<div className="w-full">
  
  <table className="w-full table-fixed">
    
<thead className="bg-gray-50 border-b border-gray-200">
  
  {/* HEADER */}
  <tr>
    {[
      {
        label: "App Field",
        field: "appField",
      },
      {
        label: "Client Field",
        field: "clientField",
      },
      {
        label: "JSON Path",
        field: "actualPath",
      },
      {
        label: "Value",
        field: "value",
      },
      {
        label: "Status",
        field: "status",
      },
    ].map((column) => (
      <th
        key={column.field}
        onClick={() =>
          handleSort(
            column.field
          )
        }
        className="px-6 py-4 text-left text-base font-semibold text-gray-700 cursor-pointer select-none whitespace-nowrap"
      >
<div className="flex items-center gap-2 group">
  
  <span>
    {column.label}
  </span>

  {/* SORT ICON */}
  <span
    className={`text-sm transition-all duration-200
    ${
      sortField ===
      column.field
        ? "text-gray-700 opacity-100"
        : "text-gray-300 opacity-70 group-hover:opacity-100 group-hover:text-gray-500"
    }`}
  >
    {sortField ===
    column.field ? (
      sortDirection ===
      "asc" ? (
        "▲"
      ) : (
        "▼"
      )
    ) : (
      "⇅"
    )}
  </span>
</div>
      </th>
    ))}
  </tr>

  {/* FILTERS */}
  <tr className="bg-white border-t border-gray-100">
    
    <th className="px-4 py-3">
      <input
        type="text"
        placeholder="Filter..."
        value={filters.appField}
        onChange={(e) =>
          setFilters({
            ...filters,
            appField:
              e.target.value,
          })
        }
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
      />
    </th>

    <th className="px-4 py-3">
      <input
        type="text"
        placeholder="Filter..."
        value={
          filters.clientField
        }
        onChange={(e) =>
          setFilters({
            ...filters,
            clientField:
              e.target.value,
          })
        }
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
      />
    </th>

    <th className="px-4 py-3">
      <input
        type="text"
        placeholder="Filter..."
        value={
          filters.actualPath
        }
        onChange={(e) =>
          setFilters({
            ...filters,
            actualPath:
              e.target.value,
          })
        }
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
      />
    </th>

    <th className="px-4 py-3">
      <input
        type="text"
        placeholder="Filter..."
        value={filters.value}
        onChange={(e) =>
          setFilters({
            ...filters,
            value:
              e.target.value,
          })
        }
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
      />
    </th>

    <th className="px-4 py-3">
      <select
        value={filters.status}
        onChange={(e) =>
          setFilters({
            ...filters,
            status:
              e.target.value,
          })
        }
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
      >
        <option value="">
          All
        </option>

        <option value="Found">
          Found
        </option>

        <option value="Missing">
          Missing
        </option>
      </select>
    </th>
  </tr>
</thead>

<tbody>
  {filteredResults.map(
    (item, index) => (
      <tr
        key={index}
        className="border-b border-gray-100 hover:bg-gray-50 transition-all align-top"
      >
        
        {/* APP FIELD */}
        <td className="px-5 py-5 text-base font-semibold text-gray-800 break-words whitespace-normal">
          {item.appField}
        </td>

        {/* CLIENT FIELD */}
        <td className="px-5 py-5 text-base text-gray-700 break-words whitespace-normal">
          {item.clientField}
        </td>

        {/* PATH */}
        <td className="px-5 py-5 text-sm text-blue-600 break-all whitespace-normal">
          {item.actualPath}
        </td>

        {/* VALUE */}
        <td className="px-5 py-5 text-base text-gray-700 break-all whitespace-normal">
          {String(item.value)}
        </td>

        {/* STATUS */}
        <td className="px-5 py-5">
          {item.status ===
          "Found" ? (
            <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full text-sm font-medium">
              Found
            </span>
          ) : (
            <span className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-full text-sm font-medium">
              Missing
            </span>
          )}
        </td>

      </tr>
    )
  )}
</tbody>

  </table>
</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}