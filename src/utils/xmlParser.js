import { XMLParser } from "fast-xml-parser";

export const parseXmlToJson = (
  xmlString
) => {
  const parser = new XMLParser({
    ignoreAttributes: false,

    attributeNamePrefix: "",

    removeNSPrefix: true,

    parseTagValue: true,

    trimValues: true,
  });

  return parser.parse(xmlString);
};