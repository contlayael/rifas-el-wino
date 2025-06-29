import React from 'react';
import './Ticket.css';

function Ticket({ number, isSelected, onSelect }) {
  // Formatea el número para que siempre tenga al menos 2 dígitos (ej: 01, 02)
  const formattedNumber = number.toString().padStart(2, '0');

  return (
    <div
      className={`ticket ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(number)}
    >
      {formattedNumber}
    </div>
  );
}

export default Ticket;