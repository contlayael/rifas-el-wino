import React, { useState } from 'react';
import './PaymentPage.css';

// Puedes añadir más cuentas aquí si lo necesitas
const accounts = [
  {
    bankName: 'BBVA Bancomer',
    accountNumber: '1234567890123456',
    clabe: '012345678901234567',
    beneficiary: 'El Wino de las Rifas S.A. de C.V.'
  },
  {
    bankName: 'Spin by OXXO',
    accountNumber: '9876543210987654',
    clabe: '012345678901234568',
    beneficiary: 'El Wino de las Rifas'
  }
];

// Componente para una sola tarjeta de cuenta
const AccountCard = ({ account }) => {
  const [copiedValue, setCopiedValue] = useState(null);

  const handleCopy = (value, type) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(type);
    setTimeout(() => setCopiedValue(null), 2000); // El texto "Copiado!" desaparecerá después de 2 segundos
  };

  return (
    <div className="account-card">
      <h3>{account.bankName}</h3>
      <p className="beneficiary">A nombre de: {account.beneficiary}</p>
      <div className="account-detail">
        <label>Número de Tarjeta</label>
        <span>{account.accountNumber}</span>
        <button onClick={() => handleCopy(account.accountNumber, 'account')}>
          {copiedValue === 'account' ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      <div className="account-detail">
        <label>CLABE Interbancaria</label>
        <span>{account.clabe}</span>
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
        Realiza tu transferencia a cualquiera de las siguientes cuentas. Una vez hecho, no olvides enviar tu comprobante por WhatsApp.
      </p>
      <div className="accounts-container">
        {accounts.map((acc, index) => (
          <AccountCard key={index} account={acc} />
        ))}
      </div>
    </div>
  );
}

export default PaymentPage;