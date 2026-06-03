/**
 * Renders a JSON-LD structured-data block. Drops undefined values (via
 * JSON.stringify) so we never emit empty fields. Use one per schema object.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default JsonLd;
