import { useState } from "react";

import * as XLSX from "xlsx";

export default function ExcelUploader({
  setMappings,
}) {
  const [fileName, setFileName] =
    useState("");

  const handleUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(
        e.target.result
      );

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const jsonData =
        XLSX.utils.sheet_to_json(
          worksheet
        );

      setMappings(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      
      {/* DOWNLOAD TEMPLATE */}
      <div className="flex justify-end mb-4">
        
        <button
          onClick={() => {
            const confirmed =
              window.confirm(
                "Do you want to download the sample Excel mapping file?"
              );

            if (confirmed) {
              const link =
                document.createElement(
                  "a"
                );

              link.href =
                "/sample/AppMappingTemplate.xlsx";

              link.download =
                "AppMappingTemplate.xlsx";

              document.body.appendChild(
                link
              );

              link.click();

              document.body.removeChild(
                link
              );
            }
          }}
          className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2 rounded-2xl text-sm font-medium transition-all"
        >
          ⬇ Download Sample Excel
        </button>
      </div>

      {/* UPLOAD AREA */}
      <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-white hover:bg-gray-50 transition-all">
        
        <div className="flex flex-col items-center px-4 text-center">
          
          <div className="text-5xl mb-4">
            📄
          </div>

          <p className="text-lg font-semibold text-gray-700">
            Upload Excel Mapping File
          </p>

          <p className="text-sm text-gray-500 mt-2">
            XLSX / XLS Supported
          </p>

          {/* FILE NAME */}
          {fileName && (
            <div className="mt-5 bg-gray-100 border border-gray-200 px-4 py-2 rounded-2xl text-sm text-gray-700 max-w-full break-all">
              
              <span className="font-semibold">
                Uploaded:
              </span>{" "}
              
              {fileName}
            </div>
          )}
        </div>

        <input
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}