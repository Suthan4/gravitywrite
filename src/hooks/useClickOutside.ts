import { RefObject, useEffect, useRef } from "react";
/**
 * Custom hook to detect clicks outside a specified element.
 * @param callback - Function to call when a click outside is detected.
 * @returns A ref object to attach to the target element.
 */


export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): RefObject<T> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(); // Call the callback only when clicked outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);
  return ref;
}
