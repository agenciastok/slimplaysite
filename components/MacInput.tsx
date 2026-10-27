"use client";

import { useLayoutEffect, useRef, type ChangeEvent, type InputHTMLAttributes } from "react";
import { applyMacChange } from "@/lib/mac";

type MacInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  allowOtp?: boolean;
};

export function MacInput({ value, onChange, allowOtp = false, ...props }: MacInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const input = ref.current;
    if (!input || caret.current == null) return;
    input.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const start = input.selectionStart ?? input.value.length;
    const next = applyMacChange(value, input.value, start, allowOtp);
    caret.current = next.caret;
    onChange(next.value);
  }

  return (
    <input
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      inputMode="text"
      {...props}
      ref={ref}
      value={value}
      onChange={handleChange}
    />
  );
}
