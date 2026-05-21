import { useState } from "react";

export default function JsonInput({
  jsonText,
  setJsonText,
}) {
  const [fileName, setFileName] =
    useState("");

  const handleFileUpload = (
    event
  ) => {
    const file =
      event.target.files[0];

    if (!file) return;

    setFileName(file.name);

    const reader =
      new FileReader();

    reader.onload = (e) => {
      setJsonText(
        e.target.result
      );
    };

    reader.readAsText(file);
  };

  return (
    <div>
      
      {/* TOP ACTIONS */}
      <div className="flex items-center justify-between mb-4">
        
        <h2 className="text-xl font-semibold text-gray-800">
          API Response
        </h2>

        <label className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2 rounded-2xl text-sm font-medium transition-all cursor-pointer">
          
          ⬆ Upload JSON/XML

          <input
            type="file"
            accept=".json,.xml,.txt"
            className="hidden"
            onChange={
              handleFileUpload
            }
          />
        </label>
      </div>

      {/* FILE NAME */}
      {fileName && (
        <div className="mb-4 bg-gray-100 border border-gray-200 px-4 py-3 rounded-2xl text-sm text-gray-700 break-all">
          
          <span className="font-semibold">
            Uploaded File:
          </span>{" "}
          
          {fileName}
        </div>
      )}

      {/* TEXTAREA */}
      <textarea
        rows="20"
        value={jsonText}
        onChange={(e) =>
          setJsonText(
            e.target.value
          )
        }
        placeholder={`Paste JSON or XML response here...`}
        className="w-full rounded-3xl border border-gray-300 bg-white p-5 font-mono text-base text-gray-700 outline-none focus:ring-2 focus:ring-gray-300 resize-none"
      />

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-3">
        
        <p className="text-sm text-gray-500">
          Supports JSON, XML,
          OData XML
        </p>

        <p className="text-sm text-gray-400">
          Characters:
          {" "}
          {jsonText.length}
        </p>
      </div>
    </div>
  );
}