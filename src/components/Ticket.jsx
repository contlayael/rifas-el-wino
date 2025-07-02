import React from 'react';
import './Ticket.css';

function Ticket({ ticket, isSelected, onSelect }) {
  // Nos aseguramos de que ticket y ticket.number existan antes de usarlos
  if (!ticket || typeof ticket.number === 'undefined') {
    return null; // No renderizar nada si el boleto no es válido
  }

  // Formatea el número para que siempre tenga 5 dígitos (ej: 00001)
  const formattedNumber = ticket.number.toString().padStart(5, '0');
  
  // Asigna clases CSS según el estado del boleto
  const statusClass = ticket.status; // 'available' o 'sold'

  return (
    <div
      className={`ticket ${isSelected ? 'selected' : ''} ${statusClass}`}
      onClick={() => onSelect(ticket.number)}
    >
      {formattedNumber}
    </div>
  );
}

export default Ticket;