import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, startAt, limit as firebaseLimit, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

// Componentes
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import PrizeGallery from '../components/PrizeGallery';
import TicketGrid from '../components/TicketGrid';
import BookingModal from '../components/BookingModal';
import Legend from '../components/Legend';
import './HomePage.css';

const TICKETS_PER_PAGE = 100;

function HomePage() {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Lógica de selección y apartado ---
  const handleTicketSelect = (ticketNumber) => {
    const ticket = tickets.find(t => t.number === ticketNumber);
    if (ticket && ticket.status !== 'available') return;
    setSelectedTickets(prevSelected =>
      prevSelected.includes(ticketNumber)
        ? prevSelected.filter(n => n !== ticketNumber).sort((a, b) => a - b)
        : [...prevSelected, ticketNumber].sort((a, b) => a - b)
    );
  };
  const handleContinue = () => { if (selectedTickets.length > 0) setIsModalOpen(true); };
  const handleCloseModal = () => setIsModalOpen(false);
  const handleBooking = async (userInfo) => {
    if (selectedTickets.length === 0) return;
    const batch = writeBatch(db);
    const reservationTime = serverTimestamp();
    selectedTickets.forEach(ticketNumber => {
      const ticketRef = doc(db, 'tickets', ticketNumber.toString());
      batch.update(ticketRef, {
        status: 'pending',
        buyerName: `${userInfo.name} ${userInfo.lastname}`,
        reservationTimestamp: reservationTime
      });
    });
    try {
      await batch.commit();
      const { name, lastname, phone } = userInfo;
      const ticketList = selectedTickets.join(', ');
      const message = `¡Hola! Quiero apartar los siguientes boletos para la rifa (válido por 24 hrs):\n\n*Boletos:* ${ticketList}\n*Nombre:* ${name} ${lastname}\n*Whatsapp:* ${phone}`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=5215647714203&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      setIsModalOpen(false);
      setSelectedTickets([]);
    } catch (error) {
      console.error("Error al apartar los boletos: ", error);
      alert("Hubo un error al intentar apartar los boletos. Por favor, inténtalo de nuevo.");
    }
  };

  // --- Efecto para cargar los boletos con paginación ---
  useEffect(() => {
    setIsLoading(true);
    const firstTicket = (currentPage - 1) * TICKETS_PER_PAGE + 1;
    const q = query(
      collection(db, "tickets"), 
      orderBy("number"), 
      startAt(firstTicket), 
      firebaseLimit(TICKETS_PER_PAGE)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ticketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickets(ticketsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error al obtener los boletos: ", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [currentPage]);
  
  const totalPages = Math.ceil(99999 / TICKETS_PER_PAGE);

  return (
    <>
      <HeroSection />
      <InfoSection />
      <PrizeGallery />
      <div id="boletos" className="ticket-section-container">
        <h2 style={{color: '#ffb400', fontSize: '2.5rem'}}>¡Elige tus Boletos de la Suerte!</h2>
        <Legend />
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}>Anterior</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoading}>Siguiente</button>
        </div>
        {isLoading ? <p>Cargando boletos...</p> : (
          <TicketGrid
            tickets={tickets}
            selectedTickets={selectedTickets}
            onTicketSelect={handleTicketSelect}
          />
        )}
      </div>
      <div className="continue-button-container">
        {selectedTickets.length > 0 && <p>Boletos seleccionados: {selectedTickets.join(', ')}</p>}
        <button onClick={handleContinue} disabled={selectedTickets.length === 0} className="continue-button">Continuar</button>
      </div>
      <BookingModal isOpen={isModalOpen} onClose={handleCloseModal} onBook={handleBooking} selectedTickets={selectedTickets} />
    </>
  );
}
export default HomePage;