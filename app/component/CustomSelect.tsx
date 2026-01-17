// components/CustomSelect.tsx
import React from 'react';
import Select from 'react-select';

interface CustomSelectProps {
  value: any;
  onChange: (value: any) => void;
  options: Array<{ value: any; label: string; [key: string]: any }>;
  placeholder?: string;
  isClearable?: boolean;
  onBlur?: () => void;
  error?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  isClearable = true,
  onBlur,
  error = false
}) => {
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <Select
      value={selectedOption}
      onChange={(option: any) => onChange(option?.value || "")}
      onBlur={onBlur}
      options={options}
      placeholder={placeholder}
      isClearable={isClearable}
      classNames={{
        control: ({ isFocused }) =>
          `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
            isFocused
              ? "!border-primary-500"
              : error
              ? "!border-red-500"
              : "!border-[#DFEAF2]"
          }`,
        singleValue: () => "!text-gray-900",
        input: () => "!text-gray-900",
        placeholder: () => "!text-gray-500",
      }}
      styles={{
        menu: (base: any) => ({
          ...base,
          borderRadius: "4px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
        }),
        option: (base: any, { isFocused, isSelected }: any) => ({
          ...base,
          backgroundColor: isSelected
            ? "var(--primary-500)"
            : isFocused
            ? "var(--primary-100)"
            : "#fff",
          color: isSelected ? "#fff" : "#1F2937",
          cursor: "pointer",
        }),
        singleValue: (base: any) => ({
          ...base,
          color: "#1F2937",
        }),
        input: (base: any) => ({
          ...base,
          color: "#1F2937",
        }),
        placeholder: (base: any) => ({
          ...base,
          color: "#6B7280",
        }),
      }}
    />
  );
};

export default CustomSelect;