import React from "react";

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  placeholder: string;
  required?: boolean;
  type?: "text" | "textarea" | "select";
  options?: { id: string | number; name: string }[];
  rows?: number;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  options = [],
  rows = 3,
}) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && "*"}
    </label>

    {type === "text" && (
      <input
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        placeholder={placeholder}
        required={required}
      />
    )}

    {type === "textarea" && (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
    )}

    {type === "select" && (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    )}
  </div>
);
