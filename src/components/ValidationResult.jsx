export default function ValidationResult({
  result,
}) {
  if (!result) return null;

  return (
    <div className="w-full mt-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Validation Result
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            API Mapping Validation
          </p>
        </div>

        <div
          className={`px-5 py-2 rounded-2xl text-sm font-semibold border ${
            result.isValid
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {result.isValid
            ? "VALID"
            : "INVALID"}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        
        <div className="bg-white border border-gray-200 rounded-3xl p-5">
          <p className="text-sm text-gray-500">
            Total
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {result.totalFields}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5">
          <p className="text-sm text-gray-500">
            Matched
          </p>

          <h2 className="text-3xl font-bold text-emerald-600 mt-2">
            {
              result.matchedFields
                .length
            }
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5">
          <p className="text-sm text-gray-500">
            Missing
          </p>

          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {
              result.missingFields
                .length
            }
          </h2>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        
        <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200 px-6 py-4 text-sm font-semibold text-gray-700">
          
          <div>App Field</div>

          <div>Client Field</div>

          <div>Status</div>

          <div>Value</div>

          <div>Actual Path</div>
        </div>

        {result.results?.map(
          (item, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-4 px-6 py-5 border-b border-gray-100 text-sm items-start"
            >
              
              {/* APP FIELD */}
              <div className="break-words text-gray-800 font-medium">
                {item.appField}
              </div>

              {/* CLIENT FIELD */}
              <div className="break-words text-gray-700">
                {
                  item.clientField
                }
              </div>

              {/* STATUS */}
              <div>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                    item.status ===
                    "Found"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* VALUE */}
              <div className="break-all text-gray-700">
                {item.value}
              </div>

              {/* PATH */}
              <div className="break-all text-gray-500 text-xs">
                {
                  item.actualPath
                }
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}