export default function PredictionCard({ data }) {
  return (
    <div className="p-4 bg-white shadow rounded mt-4">
      <p><strong>Category:</strong> {data.category}</p>
      <p><strong>Skill Type:</strong> {data.skill_type}</p>
    </div>
  );
}
