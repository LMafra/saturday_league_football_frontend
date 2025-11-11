import { FaSearch } from "react-icons/fa";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => (
  <div className="relative mb-4">
    <input
      type="text"
      placeholder={placeholder}
      className="w-full rounded-full border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
    <FaSearch className="absolute left-3 top-3 text-gray-400" aria-hidden />
  </div>
);

export default SearchInput;

