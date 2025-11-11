import { ChangeEvent } from "react";

type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<InputElement>) => void;
  placeholder: string;
  required?: boolean;
  type?: "text" | "textarea" | "select";
  options?: { id: number | string; name: string }[];
  rows?: number;
}

const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  options = [],
  rows = 3,
}: FormInputProps) => (
  <div className="mb-6">
    <label className="mb-2 block text-sm font-medium text-gray-700">
      {label} {required && "*"}
    </label>
    {type === "text" && (
      <input
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        required={required}
      />
    )}
    {type === "textarea" && (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full resize-none rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
        className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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

export default FormInput;

