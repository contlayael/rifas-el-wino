import React, { useState } from 'react';

// 1. Importa todos los componentes que vas a usar en esta página
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import PrizeGallery from '../components/PrizeGallery';
import TicketGrid from '../components/TicketGrid';
import BookingModal from '../components/BookingModal';

function HomePage() {
  // 2. Aquí va TODA la lógica que antes tenías en App.jsx
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para manejar la selección/deselección de boletos
  const handleTicketSelect = (ticketNumber) => {
    // Si en el futuro usas Firebase, aquí verificarías el estado del boleto
    setSelectedTickets(prevSelected =>
      prevSelected.includes(ticketNumber)
        ? prevSelected.filter(n => n !== ticketNumber).sort((a, b) => a - b)
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
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5215647714203&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    setIsModalOpen(false);
    // setSelectedTickets([]); // Descomenta si quieres limpiar la selección después de apartar
  };

  // 3. El JSX que combina la nueva estructura visual con los componentes funcionales
  return (
    <>
      <HeroSection />
      <InfoSection />
      <PrizeGallery />

      <div className="ticket-section-container" style={{padding: '20px'}}>
        <h2 style={{color: '#ffb400', fontSize: '2.5rem'}}>¡Elige tus Boletos de la Suerte!</h2>
        <p>Para desmarcar un boleto, vuelva a seleccionarlo</p>
        <TicketGrid
          totalTickets={100} // Cuando usemos Firebase, esto vendrá de la base de datos
          selectedTickets={selectedTickets}
          onTicketSelect={handleTicketSelect}
        />
      </div>

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
      
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBook={handleBooking}
        selectedTickets={selectedTickets}
      />
    </>
  );
}

export default HomePage;