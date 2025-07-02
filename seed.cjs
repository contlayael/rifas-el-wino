const admin = require('firebase-admin');
const serviceAccount = require('./admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const ticketsCollection = db.collection('tickets');
const TOTAL_TICKETS = 99999;
const BATCH_SIZE = 500; // Límite de operaciones por lote de Firestore

async function seedDatabase() {
  console.log(`Iniciando la creación de ${TOTAL_TICKETS} boletos...`);
  let ticketCounter = 1;

  for (let i = 0; i < TOTAL_TICKETS / BATCH_SIZE; i++) {
    const batch = db.batch();

    for (let j = 0; j < BATCH_SIZE; j++) {
      if (ticketCounter > TOTAL_TICKETS) break;

      // Usamos el número como ID del documento para fácil acceso
      const ticketRef = ticketsCollection.doc(ticketCounter.toString());
      batch.set(ticketRef, {
        number: ticketCounter,
        status: 'available', // Estados: 'available', 'sold'
        buyerName: '',
        purchaseDate: null
      });
      ticketCounter++;
    }

    await batch.commit();
    console.log(`Lote ${i + 1} completado. ${ticketCounter - 1} boletos creados.`);
  }

  console.log('¡Proceso completado! Base de datos poblada.');
}

seedDatabase().catch(console.error);