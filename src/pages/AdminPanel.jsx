import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDoc, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import './AdminPanel.css'; // Asegúrate de que los estilos se importen

// --- Componente para la Fila de la Tabla de Apartados ---
// Lo creamos como un componente separado para que tenga su propia lógica de contador
const PendingTicketRow = ({ ticket, onRelease }) => {
  const [timeLeft, setTimeLeft] = useState('Calculando...');

  useEffect(() => {
    if (!ticket.reservationTimestamp) return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const expirationTime = ticket.reservationTimestamp.toDate().getTime() + (24 * 60 * 60 * 1000);
      const remainingMillis = expirationTime - now.getTime();

      if (remainingMillis <= 0) {
        setTimeLeft('Expirado');
        clearInterval(intervalId);
      } else {
        const hours = Math.floor(remainingMillis / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMillis % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    }, 60000); // Actualiza cada minuto

    // Cálculo inicial
    const now = new Date();
    const expirationTime = ticket.reservationTimestamp.toDate().getTime() + (24 * 60 * 60 * 1000);
    const remainingMillis = expirationTime - now.getTime();
    if (remainingMillis <= 0) {
      setTimeLeft('Expirado');
    } else {
        const hours = Math.floor(remainingMillis / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMillis % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
    }

    return () => clearInterval(intervalId);
  }, [ticket.reservationTimestamp]);

  return (
    <tr>
      <td>{ticket.buyerName}</td>
      <td>{ticket.number}</td>
      <td>{timeLeft}</td>
      <td>
        <button 
          className="release-button"
          onClick={() => onRelease([ticket.number], ticket.buyerName)}
        >
          Liberar
        </button>
      </td>
    </tr>
  );
};


// --- Componente Principal del Panel ---
function AdminPanel() {
  // Estados generales
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ticketNumbers, setTicketNumbers] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para las pestañas y sus datos
  const [activeTab, setActiveTab] = useState('sold');
  const [soldTicketsData, setSoldTicketsData] = useState([]);
  const [pendingTicketsData, setPendingTicketsData] = useState([]);

  // Efecto para manejar el estado de autenticación y cargar datos
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Limpiamos los datos si el usuario cierra sesión
        setSoldTicketsData([]);
        setPendingTicketsData([]);
      }
    });
    return () => unsubAuth();
  }, []);

  // Efecto para cargar los datos de las tablas cuando el usuario está logueado
  useEffect(() => {
    if (!user) return;

    // Listener para boletos VENDIDOS
    const soldQuery = query(collection(db, "tickets"), where("status", "==", "sold"), orderBy("purchaseDate", "desc"));
    const unsubSold = onSnapshot(soldQuery, (snapshot) => {
      const sales = {};
      snapshot.docs.forEach(doc => {
        const ticket = doc.data();
        if (ticket.buyerName) {
          if (!sales[ticket.buyerName]) {
            sales[ticket.buyerName] = { tickets: [], purchaseDate: ticket.purchaseDate?.toDate() };
          }
          sales[ticket.buyerName].tickets.push(ticket.number);
        }
      });
      const salesArray = Object.entries(sales).map(([name, data]) => ({ buyerName: name, ...data }));
      setSoldTicketsData(salesArray);
    }, (err) => console.error("Error al obtener ventas:", err));

    // Listener para boletos PENDIENTES
    const pendingQuery = query(collection(db, "tickets"), where("status", "==", "pending"), orderBy("reservationTimestamp", "desc"));
    const unsubPending = onSnapshot(pendingQuery, (snapshot) => {
      const pendingData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setPendingTicketsData(pendingData);
    }, (err) => console.error("Error al obtener apartados:", err));

    return () => {
      unsubSold();
      unsubPending();
    };
  }, [user]);

  // --- Funciones de Lógica (sin cambios) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Error: Verifica tus credenciales.');
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleMarkAsSold = async (e) => {
    e.preventDefault();
    if (!ticketNumbers || !buyerName) {
      alert("Por favor, ingresa los números de boleto y el nombre del comprador.");
      return;
    }
    setIsLoading(true);
    const numbersToUpdate = ticketNumbers.split(',')
      .map(num => parseInt(num.trim(), 10))
      .filter(num => !isNaN(num) && num > 0 && num <= 99999);
    if (numbersToUpdate.length === 0) {
      alert("No se encontraron números válidos.");
      setIsLoading(false);
      return;
    }
    try {
      const batch = writeBatch(db);
      for (const number of numbersToUpdate) {
        const ticketRef = doc(db, 'tickets', number.toString());
        const ticketSnap = await getDoc(ticketRef);
        if (!ticketSnap.exists() || ticketSnap.data().status === 'sold') {
          throw new Error(`El boleto #${number} no existe o ya fue vendido.`);
        }
        batch.update(ticketRef, {
          status: 'sold',
          buyerName: buyerName,
          purchaseDate: serverTimestamp()
        });
      }
      await batch.commit();
      alert(`¡${numbersToUpdate.length} boletos marcados como vendidos con éxito!`);
      setTicketNumbers('');
      setBuyerName('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReleaseTickets = async (ticketsToRelease, buyer) => {
    if (!window.confirm(`¿Estás seguro de que quieres liberar los boletos de ${buyer}? Esta acción no se puede deshacer.`)) {
      return;
    }
    const batch = writeBatch(db);
    ticketsToRelease.forEach(ticketNumber => {
      const ticketRef = doc(db, 'tickets', ticketNumber.toString());
      batch.update(ticketRef, {
        status: 'available',
        buyerName: '',
        purchaseDate: null,
        reservationTimestamp: null
      });
    });
    try {
      await batch.commit();
      alert(`Boletos de ${buyer} liberados correctamente.`);
    } catch (error) {
      alert("Error al liberar los boletos.");
      console.error("Error: ", error);
    }
  };

  // --- Renderizado ---
  if (!user) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin}>
          <h2>Acceso de Administrador</h2>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
          <button type="submit">Ingresar</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Panel de Administración</h2>
        <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
      </div>
      
      <div className="admin-form-container">
        <h3>Marcar Boletos como Vendidos</h3>
        <form onSubmit={handleMarkAsSold}>
            <textarea
              value={ticketNumbers}
              onChange={(e) => setTicketNumbers(e.target.value)}
              placeholder="Ingresa los números de boleto separados por comas. Ej: 15, 432, 80112"
              required
              rows="4"
            />
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Nombre del comprador"
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Marcar como Vendido'}
            </button>
        </form>
      </div>

      <div className="tab-container">
        <div className="tab-buttons">
          <button className={`tab-button ${activeTab === 'sold' ? 'active' : ''}`} onClick={() => setActiveTab('sold')}>
            Vendidos ({soldTicketsData.length})
          </button>
          <button className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            Apartados ({pendingTicketsData.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'sold' && (
            <div className="sales-table-container">
              <h3>Historial de Ventas</h3>
              <table>
                <thead>
                  <tr>
                    <th>Comprador</th>
                    <th>Boletos Adquiridos</th>
                    <th>Fecha de Compra</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {soldTicketsData.length > 0 ? (
                    soldTicketsData.map((sale) => (
                      <tr key={sale.buyerName}>
                        <td>{sale.buyerName}</td>
                        <td>{sale.tickets.sort((a, b) => a - b).join(', ')}</td>
                        <td>{sale.purchaseDate ? sale.purchaseDate.toLocaleDateString('es-MX') : 'N/A'}</td>
                        <td>
                          <button 
                            className="release-button"
                            onClick={() => handleReleaseTickets(sale.tickets, sale.buyerName)}
                          >
                            Liberar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">Aún no hay boletos vendidos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="sales-table-container">
              <h3>Boletos Apartados (Pendientes de Pago)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Comprador (Temporal)</th>
                    <th>Boleto</th>
                    <th>Tiempo Restante</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTicketsData.length > 0 ? (
                    pendingTicketsData.map((ticket) => (
                      <PendingTicketRow 
                        key={ticket.id}
                        ticket={ticket}
                        onRelease={handleReleaseTickets}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No hay boletos apartados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;