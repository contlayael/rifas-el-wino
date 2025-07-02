import React, { useState } from 'react';
import './PaymentPage.css';

// --- DATOS DE CUENTAS ACTUALIZADOS ---
const accounts = [
  {
    bankName: 'Banco Azteca (Opción 1)',
    accountNumber: '5263 5401 5714 6750',
    clabe: '1271 8001 3593 048194',
    beneficiary: 'Edwin Adair Sandoval Navarrete' // <-- CAMBIA ESTE NOMBRE
  },
  {
    bankName: 'Banco Azteca (Opción 2)',
    accountNumber: '5343 8102 1122 6201',
    clabe: '1271 8000 1810 224072',
    beneficiary: 'Edwin Adair Sandoval Navarrete' // <-- CAMBIA ESTE NOMBRE
  },
  {
    bankName: 'Coppel (BanCoppel)',
    accountNumber: '4169 1614 8011 1490',
    clabe: '1371 8010 5195 227004',
    beneficiary: 'Edwin Adair Sandoval Navarrete' // <-- CAMBIA ESTE NOMBRE
  },
  {
    bankName: 'Banamex (Citibanamex)',
    accountNumber: '5204 1662 0727 3790',
    clabe: '0024 4370 2166 462050',
    beneficiary: 'Edwin Adair Sandoval Navarreter' // <-- CAMBIA ESTE NOMBRE
  }
];

// Componente para una sola tarjeta de cuenta (sin cambios)
const AccountCard = ({ account }) => {
  const [copiedValue, setCopiedValue] = useState(null);

  const handleCopy = (value, type) => {
    // Quita los espacios para copiar solo los números
    const cleanValue = value.replace(/\s/g, '');
    navigator.clipboard.writeText(cleanValue);
    setCopiedValue(type);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  return (
    <div className="account-card">
      <h3>{account.bankName}</h3>
      <p className="beneficiary">A nombre de: {account.beneficiary}</p>
      <div className="account-detail">
        <div>
            <label>Número de Tarjeta</label>
            <span>{account.accountNumber}</span>
        </div>
        <button onClick={() => handleCopy(account.accountNumber, 'account')}>
          {copiedValue === 'account' ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      <div className="account-detail">
        <div>
            <label>CLABE Interbancaria</label>
            <span>{account.clabe}</span>
        </div>
        <button onClick={() => handleCopy(account.clabe, 'clabe')}>
          {copiedValue === 'clabe' ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  );
};

// Componente principal de la página
function PaymentPage() {
  return (
    <div className="payment-page">
      <h1>Cuentas para Realizar tu Pago</h1>
      <p className="payment-instructions">
        Realiza tu transferencia o depósito a cualquiera de las siguientes cuentas.
      </p>

      {/* --- NOTA IMPORTANTE AÑADIDA --- */}
      <div className="important-note">
        ❗ AL REALIZAR TU PAGO, MANDA UNA FOTO O CAPTURA DE PANTALLA DE TU COMPROBANTE POR WHATSAPP AL NÚMERO 5647714203 PARA CONFIRMAR TU COMPRA ❗
      </div>

      <div className="accounts-container">
        {accounts.map((acc, index) => (
          <AccountCard key={index} account={acc} />
        ))}
      </div>
    </div>
  );
}

export default PaymentPage;