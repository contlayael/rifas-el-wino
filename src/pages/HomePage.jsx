import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, auth, app } from '../firebaseConfig.js';
import { FixedSizeList as List } from 'react-window';

// Componentes
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import PrizeGallery from '../components/PrizeGallery';
import Ticket from '../components/Ticket';
import BookingModal from '../components/BookingModal';
import Legend from '../components/Legend';
import './HomePage.css';

// --- Constantes de Configuración ---
const TICKET_SIZE = 90; // Tamaño de cada boleto para la cuadrícula

function HomePage() {
  // --- Estados del Componente ---
  const [allTickets, setAllTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // --- Lógica para Columnas Responsivas ---
  const ticketsPerRow = windowWidth < 500 ? 4 : 6;

  // --- Funciones de Lógica ---
  const handleTicketSelect = useCallback((ticketNumber) => {
    const ticket = allTickets.find(t => t.number === ticketNumber);
    if (ticket && ticket.status !== 'available') return;
    
    setSelectedTickets(prevSelected =>
      prevSelected.includes(ticketNumber)
        ? prevSelected.filter(n => n !== ticketNumber).sort((a, b) => a - b)
        : [...prevSelected, ticketNumber].sort((a, b) => a - b)
    );
  }, [allTickets]);

  const handleContinue = () => {
    if (selectedTickets.length > 0) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBooking = async (userInfo) => {
    if (selectedTickets.length === 0) return;
    setIsBooking(true);

    const functions = getFunctions(app, 'us-central1');
    const reserveTicketsFn = httpsCallable(functions, 'reserveTickets');  
    
    try {
      const result = await reserveTicketsFn({ 
        tickets: selectedTickets, 
        buyerInfo: userInfo 
      });

      if (result.data.success) {
        const ticketList = selectedTickets.join(', ');
        const message = `¡Hola! Quiero apartar los siguientes boletos (válido por 24 hrs):\n\n*Boletos:* ${ticketList}\n*Nombre:* ${userInfo.name} ${userInfo.lastname}\n*Whatsapp:* ${userInfo.phone}`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=5215647714203&text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        alert('¡Boletos apartados con éxito! Tienes 24 horas para realizar tu pago y enviar tu comprobante.');
      } else {
        throw new Error(result.data.error || 'No se pudieron apartar los boletos.');
      }
    } catch (error) {
      console.error("Error al apartar los boletos: ", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsModalOpen(false);
      setSelectedTickets([]);
      setIsBooking(false);
    }
  };

  // --- Efectos de React ---

  // Efecto para cargar TODOS los boletos desde Firebase
  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "tickets"), orderBy("number", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ticketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllTickets(ticketsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error al obtener los boletos: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Efecto para detectar el cambio de tamaño de la ventana
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Componente interno para renderizar cada fila de la lista virtualizada ---
  const Row = ({ index, style }) => {
    const ticketsInRow = [];
    const startIndex = index * ticketsPerRow;
    for (let i = 0; i < ticketsPerRow; i++) {
      const ticketIndex = startIndex + i;
      if (ticketIndex < allTickets.length) {
        ticketsInRow.push(allTickets[ticketIndex]);
      }
    }
    return (
      <div className="ticket-row" style={style}>
        {ticketsInRow.map(ticket => (
          <Ticket key={ticket.id} ticket={ticket} isSelected={selectedTickets.includes(ticket.number)} onSelect={handleTicketSelect} />
        ))}
      </div>
    );
  };

  const rowCount = Math.ceil(allTickets.length / ticketsPerRow);

  // --- Renderizado del Componente Principal ---
  return (
    <>
      <HeroSection />
      <InfoSection />
      <PrizeGallery />
      <div id="boletos" className="ticket-section-container">
        <h2>¡Elige tus Boletos de la Suerte!</h2>
        <Legend />
        <p className="instructions">Haz scroll para ver todos los boletos del 00001 al 99999</p>
        
        <div className="virtualized-grid-container">
          {isLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Cargando 99,999 boletos...</p>
            </div>
          ) : (
            <List
              height={600}
              itemCount={rowCount}
              itemSize={TICKET_SIZE}
              width={Math.min(windowWidth, ticketsPerRow * TICKET_SIZE + (ticketsPerRow - 1) * 10)}
            >
              {Row}
            </List>
          )}
        </div>
      </div>

      <div className="continue-button-container">
        {selectedTickets.length > 0 && <p>Boletos seleccionados: {selectedTickets.join(', ')}</p>}
        <button onClick={handleContinue} disabled={selectedTickets.length === 0} className="continue-button">Continuar</button>
      </div>
      
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onBook={handleBooking} 
        selectedTickets={selectedTickets}
        isBooking={isBooking}
      />
    </>
  );
}

export default HomePage;