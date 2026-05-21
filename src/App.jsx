import { useState } from "react";

import ExcelUploader from "./components/ExcelUploader";
import JsonInput from "./components/JsonInput";
import { parseXmlToJson } from "./utils/xmlParser";

import { validateMappings } from "./utils/validator";

export default function App() {
  const [jsonText, setJsonText] =
    useState("");

  const [mappings, setMappings] =
    useState([]);

  const [results, setResults] =
    useState([]);

  const [summary, setSummary] =
    useState(null);

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
              
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">
                  Validation Result
                </h2>
              </div>

<div className="w-full">
  
  <table className="w-full table-fixed">
    
<thead className="bg-gray-50 border-b border-gray-200">
  <tr>
    
    <th className="w-[15%] px-5 py-5 text-left text-base font-semibold text-gray-700 break-words">
      App Field
    </th>

    <th className="w-[15%] px-5 py-5 text-left text-base font-semibold text-gray-700 break-words">
      Client Field
    </th>

    <th className="w-[30%] px-5 py-5 text-left text-base font-semibold text-gray-700 break-words">
      JSON/XML Path
    </th>

    <th className="w-[25%] px-5 py-5 text-left text-base font-semibold text-gray-700 break-words">
      Value
    </th>

    <th className="w-[15%] px-5 py-5 text-left text-base font-semibold text-gray-700 break-words">
      Status
    </th>

  </tr>
</thead>

<tbody>
  {results.map(
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