import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage'; // Asegúrate que la ruta sea correcta
// import AdminPanel from './pages/AdminPanel'; // La usaremos en el futuro

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            {/* Esta línea le dice a React: "Cuando alguien visite la página principal ('/'), 
                muestra el componente HomePage" */}
            <Route path="/" element={<HomePage />} />
            
            {/* Aquí vivirá nuestro panel de admin más adelante */}
            {/* <Route path="/admin" element={<AdminPanel />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;