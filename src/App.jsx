import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import TicketGrid from './components/TicketGrid';
import BookingModal from './components/BookingModal';

function App() {
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para manejar la selección/deselección de boletos
  const handleTicketSelect = (ticketNumber) => {
    setSelectedTickets(prevSelected =>
      prevSelected.includes(ticketNumber)
        ? prevSelected.filter(n => n !== ticketNumber)
        .sort((a, b) => a - b)
        : [...prevSelected, ticketNumber].sort((a, b) => a - b)
    );
  };

  // Función para abrir el modal
  const handleContinue = () => {
    if (selectedTickets.length > 0) {
      setIsModalOpen(true);
    }
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Función para apartar los boletos y redirigir a WhatsApp
  const handleBooking = (userInfo) => {
    const { name, lastname, phone } = userInfo;
    const ticketList = selectedTickets.join(', ');
    const message = `¡Hola! Quiero apartar los siguientes boletos para la rifa:\n\n*Boletos:* ${ticketList}\n*Nombre:* ${name} ${lastname}\n*Whatsapp:* ${phone}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5215647714203&text=${encodeURIComponent(message)}`; // Reemplaza con tu número de WhatsApp

    window.open(whatsappUrl, '_blank');
    setIsModalOpen(false);
    // Opcional: podrías limpiar los boletos seleccionados después de apartar
    // setSelectedTickets([]);
  };


  return (
    <div className="App">
      <Header />
      <main>
        <h2>Selecciona tus boletos de la suerte</h2>
        <p>Total de boletos: 100</p>
        <TicketGrid
          totalTickets={100}
          selectedTickets={selectedTickets}
          onTicketSelect={handleTicketSelect}
        />
        <div className="continue-button-container">
           {selectedTickets.length > 0 && <p>Boletos seleccionados: {selectedTickets.join(', ')}</p>}
          <button
            onClick={handleContinue}
            disabled={selectedTickets.length === 0}
            className="continue-button"
          >
            Continuar
          </button>
        </div>
      </main>
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBook={handleBooking}
        selectedTickets={selectedTickets}
      />
    </div>
  );
}

export default App;