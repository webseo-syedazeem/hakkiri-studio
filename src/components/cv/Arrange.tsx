"use client";

import { type DragEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { moveById, moveItem } from "@/lib/cv/edit";
import { Btn } from "./ui";
import { Dialog } from "./Dialog";
import { Menu, type MenuItem } from "./Menu";

/**
 * The controls every repeatable item carries: a switch that keeps it in or
 * out of this version, a handle to drag it, a Move menu that does the same
 * from the keyboard or a phone, and Remove. An item that is switched off is
 * kept; it is only left off the paper.
 */

/** An on/off switch. `label` says what it switches. */
export function Switch({ checked, onChange, label, showWord = true }: { checked: boolean; onChange: (on: boolean) => void; label: string; showWord?: boolean }) {
  return (
    <span className="cv-switch-wrap">
      <button type="button" role="switch" aria-checked={checked} aria-label={label} title={checked ? "In this version" : "Off in this version"} className="cv-switch" onClick={() => onChange(!checked)}>
        <span aria-hidden="true" />
      </button>
      {showWord && <span className="cv-switch-word" data-off={!checked || undefined} aria-hidden="true">{checked ? "Included" : "Off in this version"}</span>}
    </span>
  );
}

export function OffChip() {
  return <span className="cv-chip cv-off-chip">Off in this version</span>;
}

/** Move up, Move down and Move to a position, for an item at `index` of `count`. */
export function MoveMenu({ index, count, name, onMove }: { index: number; count: number; name: string; onMove: (to: number) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const go = (to: number) => {
    setOpen(false);
    onMove(to);
    toggle.current?.focus();
  };
  return (
    <span className="cv-menu" ref={wrap}>
      <Btn kind="quiet" ref={toggle} aria-expanded={open} aria-controls={open ? id : undefined} aria-label={`Move ${name}`} disabled={count < 2} onClick={() => setOpen((v) => !v)}>
        Move
      </Btn>
      {open && (
        <div id={id} role="group" aria-label={`Move ${name}`} className="cv-menu-list">
          <button type="button" disabled={index === 0} onClick={() => go(index - 1)}>
            Move up
          </button>
          <button type="button" disabled={index === count - 1} onClick={() => go(index + 1)}>
            Move down
          </button>
          <div className="cv-menu-to">
            <label htmlFor={`${id}-to`}>Move to</label>
            <select id={`${id}-to`} value={index} onChange={(e) => go(Number(e.target.value))}>
              {Array.from({ length: count }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? "1 (top)" : i === count - 1 ? `${i + 1} (bottom)` : i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </span>
  );
}

/** What is being dragged, and in which list: a drop only lands in the list the item came from. */
let dragging: { list: string; id: string } | null = null;

/**
 * Drag and drop for one list. `row(id)` goes on each item and `grip(id)` on
 * its handle. Dropping an item on another puts it in that place. The Move
 * menu does the same without a mouse.
 */
export function useDragOrder<T extends { id: string }>(items: readonly T[], onChange: (next: T[]) => void) {
  const list = useId();
  const [over, setOver] = useState("");
  return {
    grip: (id: string) => ({
      draggable: true,
      onDragStart: (e: DragEvent) => {
        dragging = { list, id };
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
      },
      onDragEnd: () => {
        dragging = null;
        setOver("");
      },
    }),
    row: (id: string) => ({
      "data-drop": over === id ? "true" : undefined,
      onDragOver: (e: DragEvent) => {
        if (dragging?.list !== list || dragging.id === id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (over !== id) setOver(id);
      },
      onDragLeave: () => over === id && setOver(""),
      onDrop: (e: DragEvent) => {
        if (dragging?.list !== list) return;
        e.preventDefault();
        const from = dragging.id;
        dragging = null;
        setOver("");
        if (from !== id) onChange(moveById(items, from, id));
      },
    }),
    move: (id: string, to: number) => onChange(moveItem(items, items.findIndex((x) => x.id === id), to)),
  };
}

/** The handle an item is dragged by. Pointer only: the Move menu is the same thing for keyboard and touch. */
export function Grip(props: Record<string, unknown>) {
  return (
    <span className="cv-grip" aria-hidden="true" title="Drag to reorder" {...props}>
      ⠿
    </span>
  );
}

/**
 * The controls for one item of a list (design spec v3 §02): a labelled Included / Off in this version
 * switch beside it, then a ⋯ menu — Move up, Move down, anything particular to the item (Help me word this,
 * Practise this), Switch off for this version or Include in this version, and Remove. Moves that can't be
 * made are disabled at the ends. Remove asks first, and Undo brings the item back. Switching off keeps the
 * words exactly; it only leaves the item out of this version.
 */
export function ItemControls({ name, index, count, visible, onVisible, onMove, onRemove, children, extra = [] }: { name: string; index: number; count: number; visible: boolean; onVisible: (on: boolean) => void; onMove: (to: number) => void; onRemove?: () => void; children?: ReactNode; extra?: MenuItem[] }) {
  const [confirm, setConfirm] = useState(false);
  const items: MenuItem[] = [
    { label: "Move up", disabled: index === 0, onSelect: () => onMove(index - 1) },
    { label: "Move down", disabled: index >= count - 1, onSelect: () => onMove(index + 1) },
    ...extra.map((x, i) => (i === 0 ? { ...x, divide: true } : x)),
    { label: visible ? "Switch off for this version" : "Include in this version", divide: true, onSelect: () => onVisible(!visible) },
    ...(onRemove ? [{ label: "Remove", danger: true, onSelect: () => setConfirm(true) }] : []),
  ];
  return (
    <span className="cv-controls">
      <Switch checked={visible} onChange={onVisible} label={`Include ${name} in this version`} />
      {children}
      <Menu label={`Actions for ${name}`} trigger={<span aria-hidden="true">⋯</span>} items={items} />
      {confirm && onRemove && (
        <Dialog
          title={`Remove ${name}?`}
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Btn onClick={() => setConfirm(false)}>Keep it</Btn>
              <Btn
                kind="danger"
                onClick={() => {
                  setConfirm(false);
                  onRemove();
                }}
              >
                Remove
              </Btn>
            </>
          }
        >
          <p style={{ margin: 0 }}>It comes out of this CV. You can bring it back straight away with Undo. To keep it but leave it off this version, use Switch off instead.</p>
        </Dialog>
      )}
    </span>
  );
}
