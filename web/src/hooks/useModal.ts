"use client";

import { useEffect, useId, type RefObject } from "react";

const modalStack: string[] = [];

function isTopmostModal(id: string): boolean {
  return modalStack[modalStack.length - 1] === id;
}

function findFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(",")
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

function lockBodyScroll() {
  const body = document.body;
  const count = Number(body.dataset.modalLockCount || "0") + 1;
  body.dataset.modalLockCount = String(count);
  body.style.overflow = "hidden";
}

function unlockBodyScroll() {
  const body = document.body;
  const count = Math.max(0, Number(body.dataset.modalLockCount || "0") - 1);

  if (count === 0) {
    delete body.dataset.modalLockCount;
    body.style.overflow = "";
    return;
  }

  body.dataset.modalLockCount = String(count);
}

interface UseModalOptions {
  isOpen: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export function useModal({
  isOpen,
  onClose,
  dialogRef,
  initialFocusRef,
}: UseModalOptions) {
  const modalId = useId();

  useEffect(() => {
    if (!isOpen) return;

    modalStack.push(modalId);
    lockBodyScroll();

    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusDialog = () => {
      if (!isTopmostModal(modalId)) {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const nextFocus =
        initialFocusRef?.current || findFocusableElements(dialog)[0] || dialog;
      nextFocus.focus();
    };

    const frameId = window.requestAnimationFrame(focusDialog);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTopmostModal(modalId)) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusable = findFocusableElements(dialog);
      if (focusable.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (e.shiftKey && activeElement === first) {
        e.preventDefault();
        last.focus();
        return;
      }

      if (!e.shiftKey && activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (!isTopmostModal(modalId)) {
        return;
      }

      const dialog = dialogRef.current;
      const target = e.target;

      if (!dialog || !(target instanceof Node) || dialog.contains(target)) {
        return;
      }

      focusDialog();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);

      const index = modalStack.lastIndexOf(modalId);
      if (index >= 0) {
        modalStack.splice(index, 1);
      }
      unlockBodyScroll();

      if (
        previousActiveElement &&
        document.contains(previousActiveElement) &&
        typeof previousActiveElement.focus === "function"
      ) {
        previousActiveElement.focus();
      }
    };
  }, [dialogRef, initialFocusRef, isOpen, modalId, onClose]);
}
