import { useState } from "react";

export default function useExcelReader() {
  const [headers, setHeaders] =
    useState([]);

  return {
    headers,
    setHeaders,
  };
}