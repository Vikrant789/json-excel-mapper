import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelUploader({
  setMappings,
}) {
  const [fileName, setFileName] =
    useState("");

  const [isDragging, setIsDragging] =
    useState(false);

  const [isValidDrag, setIsValidDrag] =
    useState(true);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [showPreview, setShowPreview] =
    useState(false);

  const [previewData, setPreviewData] =
    useState([]);

  // PREVENT BROWSER OPENING FILE
  useEffect(() => {
    const preventDefaults = (
      e
    ) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener(
      "dragenter",
      preventDefaults
    );

    document.addEventListener(
      "dragover",
      preventDefaults
    );

    document.addEventListener(
      "drop",
      preventDefaults
    );

    return () => {
      document.removeEventListener(
        "dragenter",
        preventDefaults
      );

      document.removeEventListener(
        "dragover",
        preventDefaults
      );

      document.removeEventListener(
        "drop",
        preventDefaults
      );
    };
  }, []);

  const isExcelFile = (file) => {
    if (!file) return false;

    const validExtensions = [
      ".xlsx",
      ".xls",
    ];

    return validExtensions.some(
      (ext) =>
        file.name
          .toLowerCase()
          .endsWith(ext)
    );
  };

  const processFile = (file) => {
    if (!file) return;

    if (!isExcelFile(file)) {
      alert(
        "Only Excel files (.xlsx, .xls) are allowed"
      );

      return;
    }

    setFileName(file.name);

    setUploadProgress(10);

    const reader = new FileReader();

    reader.onloadstart = () => {
      setUploadProgress(25);
    };

    reader.onprogress = () => {
      setUploadProgress(60);
    };

    reader.onload = (e) => {
      setUploadProgress(90);

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

      // FULL PREVIEW
      setPreviewData(jsonData);

      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(0);
      }, 1200);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = (event) => {
    const file =
      event.target.files[0];

    processFile(file);
  };

const handleDragOver = (
  event
) => {
  event.preventDefault();
  event.stopPropagation();

  event.dataTransfer.dropEffect =
    "copy";

  setIsDragging(true);

  // DO NOT VALIDATE HERE
  // Browser cannot reliably detect file extension during drag
  // especially on Mac browsers

  setIsValidDrag(true);
};

  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    setIsValidDrag(true);
  };

  const handleDrop = (
  event
) => {
  // STOP browser behavior FIRST
  event.preventDefault();
  event.stopPropagation();

  setIsDragging(false);

  const files =
    event.dataTransfer.files;

  if (
    !files ||
    files.length === 0
  ) {
    return;
  }

  const file = files[0];

  // VALIDATE EXTENSION
  const validExtensions = [
    ".xlsx",
    ".xls",
  ];

  const isValid =
    validExtensions.some(
      (ext) =>
        file.name
          .toLowerCase()
          .endsWith(ext)
    );

  // INVALID FILE
  if (!isValid) {
    setIsValidDrag(false);

    // CLEAR DRAG DATA
    event.dataTransfer.clearData();

    alert(
      "Only Excel files (.xlsx, .xls) are allowed"
    );

    return false;
  }

  // VALID FILE
  setIsValidDrag(true);

  processFile(file);

  // CLEAR DATA
  event.dataTransfer.clearData();

  return false;
};

  return (
    <div>
      
      {/* DOWNLOAD */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            const confirmDownload =
              window.confirm(
                "Do you want to download the sample Excel template?"
              );

            if (
              confirmDownload
            ) {
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

      {/* DRAG AREA */}
{/* DRAG AREA */}
<div
  onDragOver={(e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  }}
  onDragLeave={(e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  }}
  onDrop={(e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const file =
      e.dataTransfer.files[0];

    if (!file) return;

    const validExtensions = [
      ".xlsx",
      ".xls",
    ];

    const isExcel =
      validExtensions.some(
        (ext) =>
          file.name
            .toLowerCase()
            .endsWith(ext)
      );

    if (!isExcel) {
      alert(
        "Only Excel files are allowed"
      );

      return;
    }

    processFile(file);
  }}
  className={`relative flex flex-col items-center justify-center w-full min-h-[340px] p-8 border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden
  ${
    isDragging
      ? "border-gray-500 bg-gray-100"
      : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
  }`}
>
  
  {/* OVERLAY */}
  {isDragging && (
    <div className="absolute inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-white px-8 py-6 rounded-3xl shadow-xl border border-gray-200">
        <div className="text-center">
          
          <div className="text-5xl mb-3">
            📄
          </div>

          <h3 className="text-xl font-bold text-gray-700">
            Drop Excel File Here
          </h3>
        </div>
      </div>
    </div>
  )}

  {/* PROGRESS */}
  {uploadProgress > 0 && (
    <div
      className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-300"
      style={{
        width: `${uploadProgress}%`,
      }}
    />
  )}

  {/* CONTENT */}
  <div className="flex flex-col items-center z-0">
    
    <div className="text-6xl mb-5">
      📄
    </div>

    <p className="text-2xl font-bold text-gray-700">
      Drag & Drop Excel File
    </p>

    <button
      type="button"
      onClick={() => {
        document
          .getElementById(
            "excel-upload"
          )
          .click();
      }}
      className="mt-5 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-sm font-medium transition-all shadow-sm"
    >
      Browse Excel File
    </button>

    <p className="text-sm text-gray-400 mt-4">
      XLSX / XLS Supported
    </p>

{fileName && (
  <div className="mt-6 w-full">
    
    <div className="bg-gray-50 border border-gray-200 rounded-3xl px-5 py-4 shadow-sm">
      
      <div className="flex items-center gap-4 min-w-0">
        
        {/* ICON */}
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
          📄
        </div>

        {/* FILE DETAILS */}
        <div className="flex-1 min-w-0">
          
          <p className="text-sm text-gray-500 mb-1">
            Uploaded File
          </p>

          <p className="text-base font-semibold text-gray-700 truncate">
            {fileName}
          </p>
        </div>
      </div>
    </div>
  </div>
)}
  </div>

  {/* INPUT */}
  <input
    id="excel-upload"
    type="file"
    className="hidden"
    accept=".xlsx,.xls"
    onChange={handleUpload}
  />
</div>

      {/* PREVIEW SECTION */}
      {previewData.length > 0 && (
        <>
          <div className="mt-6 flex justify-between items-center">
            
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                File Preview
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Preview uploaded Excel mapping data
              </p>
            </div>

            <button
              onClick={() =>
                setShowPreview(true)
              }
              className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl text-sm font-medium transition-all shadow-sm"
            >
              👁 View Full Preview
            </button>
          </div>

          {/* MODAL */}
          {showPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
              
              <div className="bg-white w-full max-w-7xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                
                {/* HEADER */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gray-50">
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Excel File Preview
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {fileName}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowPreview(
                        false
                      )
                    }
                    className="w-12 h-12 rounded-2xl bg-white border border-gray-200 hover:bg-gray-100 text-xl transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* TABLE */}
                <div className="max-h-[75vh] overflow-auto">
                  
                  <table className="w-full text-base">
                    
                    <thead className="sticky top-0 bg-gray-100 z-10">
                      <tr>
                        {Object.keys(
                          previewData[0]
                        ).map((key) => (
                          <th
                            key={key}
                            className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {previewData.map(
                        (
                          row,
                          index
                        ) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            {Object.values(
                              row
                            ).map(
                              (
                                value,
                                i
                              ) => (
                                <td
                                  key={i}
                                  className="px-6 py-4 text-gray-700 whitespace-nowrap"
                                >
                                  {String(
                                    value
                                  )}
                                </td>
                              )
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* FOOTER */}
                <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                  
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    {
                      previewData.length
                    }{" "}
                    rows
                  </p>

                  <button
                    onClick={() =>
                      setShowPreview(
                        false
                      )
                    }
                    className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-sm font-medium transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}