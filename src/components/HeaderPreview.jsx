export default function HeaderPreview({
  headers,
}) {
  return (
    <div>
      <h2>Excel Headers</h2>

      {headers.map((header) => (
        <span
          key={header}
          style={{
            marginRight: "10px",
          }}
        >
          {header}
        </span>
      ))}
    </div>
  );
}