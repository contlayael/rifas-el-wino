import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  writeBatch,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { FixedSizeList as List } from "react-window";

// Componentes visuales
import HeroSection from "../components/HeroSection";
import InfoSection from "../components/InfoSection";
import PrizeGallery from "../components/PrizeGallery";
import Ticket from "../components/Ticket";
import BookingModal from "../components/BookingModal";
import Legend from "../components/Legend";
import "./HomePage.css";

// --- AJUSTES DE TAMAÑO Y COLUMNAS ---
const TICKET_SIZE = 80; // Reducimos el tamaño de cada "caja" de boleto
const TICKETS_PER_ROW_DESKTOP = 7; // Aumentamos las columnas en escritorio
const TICKETS_PER_ROW_MOBILE = 4; // Mantenemos 4 en móvil para que no se vea muy apretado

function HomePage() {
  const [allTickets, setAllTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

 // Lógica para hacer las columnas dinámicas
  const ticketsPerRow = windowWidth < 768 ? TICKETS_PER_ROW_MOBILE : TICKETS_PER_ROW_DESKTOP;

  // --- LÓGICA COMPLETA DE SELECCIÓN Y APARTADO ---
  const handleTicketSelect = useCallback(
    (ticketNumber) => {
      const ticket = allTickets.find((t) => t.number === ticketNumber);
      if (ticket && ticket.status !== "available") return;

      setSelectedTickets((prevSelected) =>
        prevSelected.includes(ticketNumber)
          ? prevSelected.filter((n) => n !== ticketNumber).sort((a, b) => a - b)
          : [...prevSelected, ticketNumber].sort((a, b) => a - b)
      );
    },
    [allTickets]
  );

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

    const batch = writeBatch(db);
    const reservationTime = serverTimestamp();

    selectedTickets.forEach((ticketNumber) => {
      const ticketRef = doc(db, "tickets", ticketNumber.toString());
      batch.update(ticketRef, {
        status: "pending",
        buyerName: `${userInfo.name} ${userInfo.lastname}`,
        reservationTimestamp: reservationTime,
      });
    });

    try {
      await batch.commit();
      const { name, lastname, phone } = userInfo;
      const ticketList = selectedTickets.join(", ");
      const message = `¡Hola! Quiero apartar los siguientes boletos para la rifa (válido por 24 hrs):\n\n*Boletos:* ${ticketList}\n*Nombre:* ${name} ${lastname}\n*Whatsapp:* ${phone}`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=5215647714203&text=${encodeURIComponent(
        message
      )}`;

      window.open(whatsappUrl, "_blank");
      setIsModalOpen(false);
      setSelectedTickets([]);
    } catch (error) {
      console.error("Error al apartar los boletos: ", error);
      alert(
        "Hubo un error al intentar apartar los boletos. Por favor, inténtalo de nuevo."
      );
    }
  };

  // --- EFECTO PARA CARGAR TODOS LOS BOLETOS ---
  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "tickets"), orderBy("number", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const ticketsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllTickets(ticketsData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error al obtener los boletos: ", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --- EFECTO PARA EL ANCHO DE LA PANTALLA ---
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    // --- Componente "Row" para la lista virtualizada (AJUSTADO) ---
  const Row = ({ index, style }) => {
    const ticketsInRow = [];
    const startIndex = index * ticketsPerRow; // Usa la variable dinámica
    for (let i = 0; i < ticketsPerRow; i++) {
      const ticketIndex = startIndex + i;
      if (ticketIndex < allTickets.length) {
        ticketsInRow.push(allTickets[ticketIndex]);
      }
    }
    return (
      <div className="ticket-row" style={style}>
        {ticketsInRow.map((ticket) => (
          <Ticket
            key={ticket.id}
            ticket={ticket}
            isSelected={selectedTickets.includes(ticket.number)}
            onSelect={handleTicketSelect}
          />
        ))}
      </div>
    );
  };

  const rowCount = Math.ceil(allTickets.length / ticketsPerRow);

  return (
    <>
      <HeroSection />
      <InfoSection />
      <PrizeGallery />
      <div id="boletos" className="ticket-section-container">
        <h2>¡Elige tus Boletos de la Suerte!</h2>
        <Legend />
        <p className="instructions">
          Haz scroll para ver todos los boletos del 00001 al 99999
        </p>

        <div className="virtualized-grid-container">
          {isLoading ? (
            // --- SPINNER CON CSS ---
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Cargando 99,999 boletos...</p>
            </div>
          ) : (
            <List
              height={600}
              itemCount={rowCount}
              itemSize={TICKET_SIZE}
              width={Math.min(
                windowWidth,
                ticketsPerRow * TICKET_SIZE + (ticketsPerRow - 1) * 20
              )}
            >
              {Row}
            </List>
          )}
        </div>
      </div>

      <div className="continue-button-container">
        {selectedTickets.length > 0 && (
          <p>Boletos seleccionados: {selectedTickets.join(", ")}</p>
        )}
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
