import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy, getDocs, limit, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { FixedSizeList as List } from 'react-window';
import Legend from '../components/Legend'; // <-- 1. Importa el componente

// Componentes visuales
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import PrizeGallery from '../components/PrizeGallery';
import Ticket from '../components/Ticket';
import BookingModal from '../components/BookingModal';
import './HomePage.css';

const TICKETS_PER_ROW = 5; 
const TICKET_SIZE = 120;
const INITIAL_LOAD_SIZE = 500;

function HomePage() {
  const [allTickets, setAllTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // --- LÓGICA COMPLETA DE SELECCIÓN Y MODAL ---
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

// Dentro del componente HomePage en src/pages/HomePage.jsx

const handleBooking = async (userInfo) => {
  if (selectedTickets.length === 0) return;

  // 1. Preparamos la actualización en lote para Firestore
  const batch = writeBatch(db);
  const reservationTime = serverTimestamp(); // Usamos la hora del servidor

  selectedTickets.forEach(ticketNumber => {
    const ticketRef = doc(db, 'tickets', ticketNumber.toString());
    batch.update(ticketRef, {
      status: 'pending',
      buyerName: `${userInfo.name} ${userInfo.lastname}`, // Guardamos el nombre temporalmente
      reservationTimestamp: reservationTime
    });
  });

  try {
    // 2. Ejecutamos la actualización en la base de datos
    await batch.commit();

    // 3. Si todo sale bien, redirigimos a WhatsApp
    const { name, lastname, phone } = userInfo;
    const ticketList = selectedTickets.join(', ');
    const message = `¡Hola! Quiero apartar los siguientes boletos para la rifa (válido por 24 hrs):\n\n*Boletos:* ${ticketList}\n*Nombre:* ${name} ${lastname}\n*Whatsapp:* ${phone}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5215647714203&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    setIsModalOpen(false);
    setSelectedTickets([]); // Limpiamos la selección

  } catch (error) {
    console.error("Error al apartar los boletos: ", error);
    alert("Hubo un error al intentar apartar los boletos. Por favor, inténtalo de nuevo.");
  }
};

  // --- EFECTO DE CARGA EN 2 FASES ---
  useEffect(() => {
    let unsubscribeFromAllTickets;
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const initialQuery = query(collection(db, "tickets"), orderBy("number", "asc"), limit(INITIAL_LOAD_SIZE));
        const initialSnapshot = await getDocs(initialQuery);
        const initialData = initialSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllTickets(initialData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error en la carga inicial: ", error);
        setIsLoading(false);
      }
      const fullQuery = query(collection(db, "tickets"), orderBy("number", "asc"));
      unsubscribeFromAllTickets = onSnapshot(fullQuery, (querySnapshot) => {
        const fullData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllTickets(fullData);
      }, (error) => {
        console.error("Error en la carga completa: ", error);
      });
    };
    fetchTickets();
    return () => {
      if (unsubscribeFromAllTickets) {
        unsubscribeFromAllTickets();
      }
    };
  }, []);

  // --- EFECTO PARA ADAPTARSE AL ANCHO DE LA PANTALLA ---
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- COMPONENTE "ROW" PARA LA LISTA VIRTUALIZADA ---
  const Row = ({ index, style }) => {
    const ticketsInRow = [];
    const startIndex = index * TICKETS_PER_ROW;
    for (let i = 0; i < TICKETS_PER_ROW; i++) {
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

  const rowCount = Math.ceil(allTickets.length / TICKETS_PER_ROW);

  return (
    <>
      <HeroSection />
      <InfoSection />
      <PrizeGallery />
      <div id="boletos" className="ticket-section-container">
        <h2>¡Elige tus Boletos de la Suerte!</h2>
         <Legend />
        <p className="instructions">Haz scroll para ver todos los boletos del 00001 al 99999</p>
        <p className="instructions">¡RECUERDA! Para desmarcar un boleto vuelve a seleccionarlo</p>
        
        
        <div className="virtualized-grid-container">
          {isLoading ? <p>Cargando boletos...</p> : (
            <List
              height={600}
              itemCount={rowCount}
              itemSize={TICKET_SIZE}
              width={Math.min(windowWidth, TICKETS_PER_ROW * TICKET_SIZE + 40)}
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
      
      <BookingModal isOpen={isModalOpen} onClose={handleCloseModal} onBook={handleBooking} selectedTickets={selectedTickets} />
    </>
  );
}

export default HomePage;