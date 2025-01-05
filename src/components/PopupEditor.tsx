'use client';

interface PopupEditorProps {
  label: string;
  color: string;
  line?: string;
  dot?: string;
  onSave: (newLabel: string, newColor: string, newLine: string, newDot: string) => void;
  onClose: () => void;
}

export default function PopupEditor({ 
  label, 
  color = '#808080',
  line = 'solid', 
  dot = '#ffffff',
  onSave, 
  onClose 
}: PopupEditorProps) {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '300px'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Label:</label>
        <input 
          type="text" 
          defaultValue={label}
          id="labelInput"
          style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Fill Color:</label>
        <input 
          type="color" 
          defaultValue={color}
          id="colorInput"
          style={{ width: '100%', height: '40px' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Line Style:</label>
        <select
          id="lineInput"
          defaultValue={line}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Dot Color:</label>
        <input 
          type="color" 
          defaultValue={dot}
          id="dotInput"
          style={{ width: '100%', height: '40px' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button 
          onClick={onClose}
          style={{
            padding: '5px 10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white'
          }}
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            const newLabel = (document.getElementById('labelInput') as HTMLInputElement).value;
            const newColor = (document.getElementById('colorInput') as HTMLInputElement).value;
            const newLine = (document.getElementById('lineInput') as HTMLSelectElement).value;
            const newDot = (document.getElementById('dotInput') as HTMLInputElement).value;
            onSave(newLabel, newColor, newLine, newDot);
          }}
          style={{
            padding: '5px 10px',
            border: 'none',
            borderRadius: '4px',
            background: '#007bff',
            color: 'white'
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
} 