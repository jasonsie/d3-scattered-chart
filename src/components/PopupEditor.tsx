'use client';

import type { PopupEditorProps } from '@/types/components';
import styles from '@/styles/PopupEditor.module.css';

/**
 * Polygon property editor modal component.
 * 
 * Displays a modal dialog for editing polygon properties including label, fill color,
 * line style, and dot color. Uses controlled inputs with default values and provides
 * save/cancel actions.
 * 
 * @param {PopupEditorProps} props - Component props
 * @param {string} props.label - Initial polygon label text
 * @param {string} props.color - Initial fill color (hex format)
 * @param {string} props.line - Initial line style ('solid', 'dashed', 'dotted')
 * @param {string} props.dot - Initial dot color (hex format)
 * @param {Function} props.onSave - Callback when user saves changes, receives PolygonStyle object
 * @param {Function} props.onClose - Callback when user cancels or closes modal
 * 
 * @returns {JSX.Element} Modal overlay with form inputs
 * 
 * @example
 * <PopupEditor
 *   label="Region 1"
 *   color="#3b82f6"
 *   line="solid"
 *   dot="#ffffff"
 *   onSave={(data) => updatePolygon(data)}
 *   onClose={() => setEditorOpen(false)}
 * />
 */
export default function PopupEditor({ 
  label, 
  color,
  line, 
  dot,
  onSave, 
  onClose 
}: PopupEditorProps) {
  return (
    <div className={styles.modal}>
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Label:</label>
        <input 
          type="text" 
          defaultValue={label}
          id="labelInput"
          className={styles.inputField}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Fill Color:</label>
        <input 
          type="color" 
          defaultValue={color}
          id="colorInput"
          className={styles.inputField}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Line Style:</label>
        <select
          id="lineInput"
          defaultValue={line}
          className={styles.inputField}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Dot Color:</label>
        <input 
          type="color" 
          defaultValue={dot}
          id="dotInput"
          className={styles.inputField}
        />
      </div>
      <div className={styles.buttonGroup}>
        <button 
          onClick={onClose}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            const newLabel = (document.getElementById('labelInput') as HTMLInputElement).value;
            const newColor = (document.getElementById('colorInput') as HTMLInputElement).value;
            const newLine = (document.getElementById('lineInput') as HTMLSelectElement).value;
            const newDot = (document.getElementById('dotInput') as HTMLInputElement).value;
            onSave({ label: newLabel, color: newColor, line: newLine, dot: newDot });
          }}
          className={styles.saveButton}
        >
          Save
        </button>
      </div>
    </div>
  );
} 