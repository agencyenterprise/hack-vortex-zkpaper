export default function ViewDocument({ data }) {
  return (
    <div className="max-w-3xl m-auto p-4 border border-gray-300">
      <div dangerouslySetInnerHTML={{ __html: data }} />
    </div>
  );
}
