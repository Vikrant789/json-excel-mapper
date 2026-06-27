import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelUploader({ setMappings }) {
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isValidDrag, setIsValidDrag] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  // Prevent browser default drag behavior
  useEffect(() => {
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("dragenter", preventDefaults);
    document.addEventListener("dragover", preventDefaults);
    document.addEventListener("drop", preventDefaults);

    return () => {
      document.removeEventListener("dragenter", preventDefaults);
      document.removeEventListener("dragover", preventDefaults);
      document.removeEventListener("drop", preventDefaults);
    };
  }, []);

  const isExcelFile = (file) => {
    if (!file) return false;
    return file.name.toLowerCase().endsWith(".xlsx") ||
           file.name.toLowerCase().endsWith(".xls");
  };

  // ✅ CLEAN COLUMN NAME FUNCTION (IMPORTANT FIX)
  const cleanKey = (key) =>
    key
      .replace(/\s+/g, " ") // replace multiple spaces with single space
      .trim();

  const processFile = (file) => {
    if (!file) return;

    if (!isExcelFile(file)) {
      alert("Only Excel files (.xlsx, .xls) are allowed");
      return;
    }

    setFileName(file.name);
    setUploadProgress(10);

    const reader = new FileReader();

    reader.onloadstart = () => setUploadProgress(25);
    reader.onprogress = () => setUploadProgress(60);

    reader.onload = (e) => {
      setUploadProgress(90);

      const data = new Uint8Array(e.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawData = XLSX.utils.sheet_to_json(worksheet);

console.log("RAW HEADERS:", Object.keys(rawData[0]));

     

const jsonData = rawData.map((row) => {
  return {
    "App Field": row["AppField"],
    "Client Field": row["ClientField"],
    "Required": row["Required"],
    "Max Length": row["Max Length"],
  };
});


      setMappings(jsonData);
      setPreviewData(jsonData);

      setUploadProgress(100);

      setTimeout(() => setUploadProgress(0), 1200);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  

  return (
    <div>

      {/* DOWNLOAD TEMPLATE */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            const confirmDownload = window.confirm(
              "Do you want to download the sample Excel template?"
            );

            if (confirmDownload) {
              const link = document.createElement("a");
              link.href = "/sample/AppMappingTemplate.xlsx";
              link.download = "AppMappingTemplate.xlsx";

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
          className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2 rounded-2xl text-sm font-medium"
        >
          ⬇ Download Sample Excel
        </button>
      </div>

      {/* DRAG AREA */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);

          const file = e.dataTransfer.files[0];
          if (!file) return;

          if (!isExcelFile(file)) {
            alert("Only Excel files are allowed");
            return;
          }

          processFile(file);
        }}
        className={`relative flex flex-col items-center justify-center w-full min-h-[340px] p-8 border-2 border-dashed rounded-3xl transition-all
        ${
          isDragging
            ? "border-gray-500 bg-gray-100"
            : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >

        {/* OVERLAY */}
        {isDragging && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
            <div className="bg-white px-6 py-4 rounded-2xl shadow">
              Drop Excel File Here
            </div>
          </div>
        )}

        {/* PROGRESS BAR */}
        {uploadProgress > 0 && (
          <div
            className="absolute top-0 left-0 h-1 bg-green-500"
            style={{ width: `${uploadProgress}%` }}
          />
        )}

        {/* CONTENT */}
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>

          <p className="text-xl font-bold">
            Drag & Drop Excel File
          </p>

          <button
            onClick={() =>
              document.getElementById("excel-upload").click()
            }
            className="mt-4 bg-gray-900 text-white px-6 py-3 rounded-2xl"
          >
            Browse File
          </button>

          <p className="text-sm text-gray-400 mt-3">
            XLSX / XLS supported
          </p>

          {fileName && (
            <p className="mt-4 text-gray-600 font-medium">
              {fileName}
            </p>
          )}
        </div>

        <input
          id="excel-upload"
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleUpload}
        />
      </div>

      {/* PREVIEW */}
      {previewData.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowPreview(true)}
            className="bg-gray-900 text-white px-5 py-3 rounded-2xl"
          >
            View Preview
          </button>

          {showPreview && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-6xl rounded-2xl overflow-auto max-h-[80vh]">

                <div className="p-4 border-b flex justify-between">
                  <h2 className="font-bold">Preview</h2>
                  <button onClick={() => setShowPreview(false)}>
                    ✕
                  </button>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="p-2 border">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="p-2 border">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}