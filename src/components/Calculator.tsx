"use client";

import { useState } from "react";
import styles from "./Calculator.module.css";

interface CalculatorProps {
  enabled: boolean;
}

type Op = "+" | "-" | "*" | "/" | null;

function formatDisplay(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  const s = String(Number(n.toPrecision(12)));
  return s.length > 14 ? n.toExponential(6) : s;
}

export function Calculator({ enabled }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Op>(null);
  const [fresh, setFresh] = useState(true);

  function inputDigit(d: string) {
    if (!enabled) return;
    setDisplay((prev) => {
      if (fresh || prev === "0" || prev === "Error") {
        setFresh(false);
        return d;
      }
      if (prev.length >= 14) return prev;
      return prev + d;
    });
  }

  function inputDot() {
    if (!enabled) return;
    setDisplay((prev) => {
      if (fresh || prev === "Error") {
        setFresh(false);
        return "0.";
      }
      if (prev.includes(".")) return prev;
      return prev + ".";
    });
  }

  function clearAll() {
    if (!enabled) return;
    setDisplay("0");
    setAcc(null);
    setPendingOp(null);
    setFresh(true);
  }

  function backspace() {
    if (!enabled) return;
    setDisplay((prev) => {
      if (fresh || prev === "Error") return prev;
      if (prev.length <= 1) {
        setFresh(true);
        return "0";
      }
      return prev.slice(0, -1);
    });
  }

  function toggleSign() {
    if (!enabled) return;
    setDisplay((prev) => {
      if (prev === "0" || prev === "Error") return prev;
      return prev.startsWith("-") ? prev.slice(1) : `-${prev}`;
    });
  }

  function applyPercent() {
    if (!enabled) return;
    const n = parseFloat(display);
    if (!Number.isFinite(n)) return;
    setDisplay(formatDisplay(n / 100));
    setFresh(true);
  }

  function applySqrt() {
    if (!enabled) return;
    const n = parseFloat(display);
    if (!Number.isFinite(n) || n < 0) {
      setDisplay("Error");
      setFresh(true);
      return;
    }
    setDisplay(formatDisplay(Math.sqrt(n)));
    setFresh(true);
  }

  function applySquare() {
    if (!enabled) return;
    const n = parseFloat(display);
    if (!Number.isFinite(n)) return;
    setDisplay(formatDisplay(n * n));
    setFresh(true);
  }

  function insertPi() {
    if (!enabled) return;
    setDisplay(formatDisplay(Math.PI));
    setFresh(true);
  }

  function compute(a: number, b: number, op: Op): number {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function setOperation(op: Op) {
    if (!enabled) return;
    const current = parseFloat(display);
    if (!Number.isFinite(current)) {
      setDisplay("Error");
      setFresh(true);
      return;
    }
    if (acc !== null && pendingOp && !fresh) {
      const result = compute(acc, current, pendingOp);
      if (!Number.isFinite(result)) {
        setDisplay("Error");
        setAcc(null);
        setPendingOp(null);
        setFresh(true);
        return;
      }
      setAcc(result);
      setDisplay(formatDisplay(result));
    } else {
      setAcc(current);
    }
    setPendingOp(op);
    setFresh(true);
  }

  function equals() {
    if (!enabled) return;
    if (pendingOp === null || acc === null) return;
    const current = parseFloat(display);
    const result = compute(acc, current, pendingOp);
    if (!Number.isFinite(result)) {
      setDisplay("Error");
    } else {
      setDisplay(formatDisplay(result));
    }
    setAcc(null);
    setPendingOp(null);
    setFresh(true);
  }

  const keys: { label: string; action: () => void; className?: string }[] = [
    { label: "C", action: clearAll, className: styles.util },
    { label: "⌫", action: backspace, className: styles.util },
    { label: "%", action: applyPercent, className: styles.util },
    { label: "÷", action: () => setOperation("/"), className: styles.op },
    { label: "√", action: applySqrt, className: styles.fn },
    { label: "x²", action: applySquare, className: styles.fn },
    { label: "π", action: insertPi, className: styles.fn },
    { label: "×", action: () => setOperation("*"), className: styles.op },
    { label: "7", action: () => inputDigit("7") },
    { label: "8", action: () => inputDigit("8") },
    { label: "9", action: () => inputDigit("9") },
    { label: "−", action: () => setOperation("-"), className: styles.op },
    { label: "4", action: () => inputDigit("4") },
    { label: "5", action: () => inputDigit("5") },
    { label: "6", action: () => inputDigit("6") },
    { label: "+", action: () => setOperation("+"), className: styles.op },
    { label: "1", action: () => inputDigit("1") },
    { label: "2", action: () => inputDigit("2") },
    { label: "3", action: () => inputDigit("3") },
    { label: "±", action: toggleSign, className: styles.fn },
    { label: "0", action: () => inputDigit("0"), className: styles.zero },
    { label: ".", action: inputDot },
    { label: "=", action: equals, className: styles.equals },
  ];

  return (
    <div
      className={`${styles.wrap} ${enabled ? "" : styles.disabled}`}
      aria-disabled={!enabled}
    >
      <div className={styles.display} aria-live="polite">
        {display}
      </div>
      <div className={styles.keys}>
        {keys.map((k) => (
          <button
            key={k.label}
            type="button"
            className={`${styles.key} ${k.className ?? ""}`}
            onClick={k.action}
            disabled={!enabled}
            aria-label={k.label === "⌫" ? "Backspace" : k.label}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
