import React from 'react';
import Ticket from './Ticket';
import './TicketGrid.css'; // Importa el archivo CSS que crearemos

function TicketGrid({ tickets, selectedTickets, onTicketSelect }) {
  return (
    <div className="ticket-grid">
      {tickets.map(ticket => (
        <Ticket
          key={ticket.id}
          ticket={ticket}
          isSelected={selectedTickets.includes(ticket.number)}
          onSelect={onTicketSelect}
        />
      ))}
    </div>
  );
}

export default TicketGrid;