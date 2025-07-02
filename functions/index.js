const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

// Define la región para tus funciones. Es una buena práctica.
setGlobalOptions({ region: "us-central1" });

admin.initializeApp();
const db = admin.firestore();

/**
 * Función Invocable para apartar boletos de forma segura.
 * El frontend llama a esta función con los números de boleto deseados.
 */
exports.reserveTickets = onCall(async (request) => {
  const { tickets, buyerInfo } = request.data;

  if (!tickets || tickets.length === 0 || !buyerInfo) {
    throw new functions.https.HttpsError('invalid-argument', 'Faltan datos para apartar los boletos.');
  }

  const reservationTime = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();

  // Revisa en una transacción que todos los boletos estén realmente disponibles.
  try {
    await db.runTransaction(async (transaction) => {
      for (const ticketNumber of tickets) {
        const ticketRef = db.collection("tickets").doc(ticketNumber.toString());
        const ticketDoc = await transaction.get(ticketRef);
        if (!ticketDoc.exists || ticketDoc.data().status !== 'available') { // <-- LÍNEA CORREGIDA
          throw new functions.https.HttpsError('already-exists', `El boleto #${ticketNumber} ya no está disponible. Alguien más lo apartó.`);
        }
      }
    });
  } catch (error) {
    console.error("Error de transacción al apartar:", error.message);
    return { success: false, error: error.message };
  }

  // Si todos están disponibles, procedemos a apartarlos.
  tickets.forEach(ticketNumber => {
    const ticketRef = db.collection("tickets").doc(ticketNumber.toString());
    batch.update(ticketRef, {
      status: 'pending',
      buyerName: `${buyerInfo.name} ${buyerInfo.lastname}`,
      reservationTimestamp: reservationTime
    });
  });

  await batch.commit();
  console.log(`Boletos ${tickets.join(', ')} apartados para ${buyerInfo.name}.`);
  return { success: true };
});


/**
 * Función Programada que se ejecuta cada hora para liberar boletos expirados.
 */
exports.releaseExpiredTickets = onSchedule("every 1 hours", async (event) => {
  console.log("Ejecutando la función para liberar boletos expirados...");

  const now = admin.firestore.Timestamp.now();
  const twentyFourHoursAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - (24 * 60 * 60 * 1000));

  const query = db.collection("tickets")
    .where("status", "==", "pending")
    .where("reservationTimestamp", "<=", twentyFourHoursAgo);

  const snapshot = await query.get();

  if (snapshot.empty) {
    console.log("No hay boletos expirados para liberar.");
    return null;
  }

  const batch = db.batch();
  snapshot.forEach(doc => {
    console.log(`Liberando boleto #${doc.id}...`);
    const ticketRef = db.collection("tickets").doc(doc.id);
    batch.update(ticketRef, {
      status: "available",
      buyerName: null,
      reservationTimestamp: null
    });
  });

  await batch.commit();
  console.log(`Proceso completado. Se liberaron ${snapshot.size} boletos.`);
  return null;
});