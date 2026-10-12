"use client";
import React, { Fragment } from "react";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";

export interface DropdownItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string | number | null;
  disabled?: boolean;
}

interface AtelierDropdownProps {
  items: DropdownItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
}

export default function AtelierDropdown({
  items,
  selectedId,
  onSelect,
  placeholder = "Select Option",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  align = "left",
}: AtelierDropdownProps) {
  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <Menu as="div" className="relative">
        {({ open }) => (
          <>
            <MenuButton
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#E3C9A8]/70 text-[#3D2B1F] text-xs sm:text-sm font-medium shadow-[0_4px_12px_rgba(61,43,31,0.04)] hover:border-[#C4896A] hover:bg-[#FFFAF5] focus:outline-none focus:ring-1 focus:ring-[#C4896A] transition-all duration-200 ${buttonClassName}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {selectedItem?.icon && (
                  <span className="text-[#C4896A] flex-shrink-0">{selectedItem.icon}</span>
                )}
                <span className="truncate">{selectedItem ? selectedItem.label : placeholder}</span>
                {selectedItem?.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF5EC] text-[#C4896A]">
                    {selectedItem.badge}
                  </span>
                )}
              </div>

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-[#7A6B5D] flex-shrink-0 transition-transform duration-200 ${
                  open ? "rotate-180 text-[#C4896A]" : ""
                }`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </MenuButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-150"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems
                className={`absolute z-[999] mt-2 w-full min-w-[220px] rounded-2xl bg-[#FFFFFF] border border-[#E3C9A8]/80 p-2 shadow-[0_16px_40px_rgba(61,43,31,0.12)] backdrop-blur-md focus:outline-none max-h-80 overflow-y-auto no-scrollbar ${
                  align === "right" ? "right-0" : "left-0"
                } ${menuClassName}`}
              >
                {items.map((item) => {
                  const isSelected = item.id === selectedId;

                  return (
                    <MenuItem key={item.id} disabled={item.disabled}>
                      {({ active, disabled }) => (
                        <button
                          type="button"
                          onClick={() => onSelect(item.id)}
                          disabled={disabled}
                          className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left ${
                            disabled
                              ? "opacity-40 cursor-not-allowed"
                              : isSelected
                              ? "bg-[#3D2B1F] text-white"
                              : active
                              ? "bg-[#FFFAF5] text-[#2A1E17]"
                              : "text-[#3D2B1F]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {item.icon && (
                              <span
                                className={
                                  isSelected
                                    ? "text-[#C4896A]"
                                    : active
                                    ? "text-[#C4896A]"
                                    : "text-[#7A6B5D]"
                                }
                              >
                                {item.icon}
                              </span>
                            )}
                            <div className="truncate">
                              <p className="truncate">{item.label}</p>
                              {item.sublabel && (
                                <p
                                  className={`text-[10px] truncate ${
                                    isSelected ? "text-white/70" : "text-[#7A6B5D]"
                                  }`}
                                >
                                  {item.sublabel}
                                </p>
                              )}
                            </div>
                          </div>

                          {item.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSelected
                                  ? "bg-[#C4896A] text-white"
                                  : "bg-[#FEF5EC] text-[#C4896A]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      )}
                    </MenuItem>
                  );
                })}
              </MenuItems>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
}
