import React from "react";

// EditableField component
function EditableField({ label, value, name, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label>{label}: </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label}`}
      />
    </div>
  );
}

export default EditableField;
