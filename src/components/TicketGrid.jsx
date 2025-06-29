import React from 'react';
import Ticket from './Ticket';
import './TicketGrid.css';

function TicketGrid({ totalTickets, selectedTickets, onTicketSelect }) {
  const tickets = Array.from({ length: totalTickets }, (_, i) => i + 1);

  return (
    <div className="ticket-grid">
      {tickets.map(number => (
        <Ticket
          key={number}
          number={number}
          isSelected={selectedTickets.includes(number)}
          onSelect={onTicketSelect}
        />
      ))}
    </div>
  );
}

export default TicketGrid;