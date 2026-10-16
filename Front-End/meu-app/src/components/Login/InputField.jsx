function InputField({ id, label, type = "text", value, onChange, placeholder, autoComplete }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="form-control"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </div>
  );
}

export default InputField;
