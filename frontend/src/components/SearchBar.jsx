export default function SearchBar({ query, onQueryChange, genre, onGenreChange, genres, sort, onSortChange }) {
  return (
    <div className="toolbar">
      <div className="search-input-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search the showcase by title..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <select className="select-genre" value={genre} onChange={(e) => onGenreChange(e.target.value)}>
        <option value="">All genres</option>
        {genres.map((g) => (
          <option key={g.id} value={g.name}>
            {g.name}
          </option>
        ))}
      </select>

      <select className="select-sort" value={sort} onChange={(e) => onSortChange(e.target.value)}>
        <option value="newest">Recently added</option>
        <option value="admin_rating">My rating</option>
        <option value="user_rating">Audience rating</option>
        <option value="title">Title A&ndash;Z</option>
      </select>
    </div>
  );
}
