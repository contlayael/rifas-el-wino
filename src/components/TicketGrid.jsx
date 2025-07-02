import React from 'react';
import Ticket from './Ticket';
import './TicketGrid.css';

function TicketGrid({ tickets, selectedTickets, onTicketSelect }) {
  // Si no hay boletos, muestra un mensaje o nada.
  if (!tickets || tickets.length === 0) {
    return <p>No hay boletos para mostrar en esta página.</p>;
  }

  return (
    <div className="ticket-grid">
      {tickets.map(ticket => (
        <Ticket
          key={ticket.id}
          ticket={ticket} // Pasamos el objeto completo del boleto
          isSelected={selectedTickets.includes(ticket.number)}
          onSelect={onTicketSelect}
        />
      ))}
    </div>
  );
}

export default TicketGrid;