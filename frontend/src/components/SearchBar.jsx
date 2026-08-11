export default function SearchBar({ genre, onGenreChange, genres }) {
  return (
    <select className="select-genre" value={genre} onChange={(e) => onGenreChange(e.target.value)}>
      <option value="">All genres</option>
      {genres.map((g) => (
        <option key={g.id} value={g.name}>
          {g.name}
        </option>
      ))}
    </select>
  );
}
