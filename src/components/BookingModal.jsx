import React, { useState } from 'react';
import './BookingModal.css';

function BookingModal({ isOpen, onClose, onBook, selectedTickets }) {
  const [userInfo, setUserInfo] = useState({
    name: '',
    lastname: '',
    phone: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Permitir solo números y limitar a 10 dígitos para el teléfono
    if (name === 'phone' && (!/^\d*$/.test(value) || value.length > 10)) {
        return;
    }
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInfo.phone.length === 10) {
      onBook(userInfo);
    } else {
      alert('Por favor, ingresa un número de WhatsApp de 10 dígitos.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Completa tus datos para apartar</h2>
        <p>Estás a punto de apartar los boletos: <strong>{selectedTickets.join(', ')}</strong></p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre(s)</label>
            <input type="text" id="name" name="name" value={userInfo.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Apellido(s)</label>
            <input type="text" id="lastname" name="lastname" value={userInfo.lastname} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Tu número de WhatsApp (10 dígitos)</label>
            <input type="tel" id="phone" name="phone" value={userInfo.phone} onChange={handleChange} required pattern="\d{10}" title="El número debe contener 10 dígitos." />
          </div>
          <button type="submit" className="book-button">Apartar y Enviar por WhatsApp</button>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;