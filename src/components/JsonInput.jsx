import { useState } from "react";

export default function JsonInput({
  jsonText,
  setJsonText,
}) {
  const [fileName, setFileName] =
    useState("");

  const processFile = (file) => {
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

  const handleFileUpload = (
    event
  ) => {
    const file =
      event.target.files[0];

    processFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file =
      event.dataTransfer.files[0];

    processFile(file);
  };

  return (
    <div>
      
      {/* TOP */}
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

      {/* DRAG DROP */}
      <div
        onDragOver={(e) =>
          e.preventDefault()
        }
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-3xl bg-white hover:bg-gray-50 transition-all p-5"
      >
        <textarea
          rows="18"
          value={jsonText}
          onChange={(e) =>
            setJsonText(
              e.target.value
            )
          }
          placeholder={`Paste or Drag & Drop JSON/XML response here...`}
          className="w-full font-mono text-base text-gray-700 outline-none resize-none bg-transparent"
        />

        {fileName && (
          <div className="mt-4 inline-block bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-700 font-medium break-all">
            {fileName}
          </div>
        )}
      </div>

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