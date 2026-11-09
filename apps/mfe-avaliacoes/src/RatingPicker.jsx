/** Escolha da nota de 0 a 10, como uma fileira de botões de rádio. */
export default function RatingPicker({ value, onChange, name }) {
  return (
    <fieldset className="rev-picker">
      <legend>Sua nota</legend>
      <div className="rev-picker__row">
        {Array.from({ length: 11 }, (_, n) => (
          <label key={n} className="rev-picker__option">
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
            <span>{n}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
