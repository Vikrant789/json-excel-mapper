import * as XLSX from "xlsx";

export const readExcelHeaders = (
  file,
  callback
) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(
      e.target.result
    );

    const workbook = XLSX.read(data, {
      type: "array",
    });

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows =
      XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      });

    callback(rows[0] || []);
  };

  reader.readAsArrayBuffer(file);
};