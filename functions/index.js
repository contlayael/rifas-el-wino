const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

// Establecemos opciones globales como la región, es una buena práctica.
setGlobalOptions({ region: "us-central1" });

admin.initializeApp();
const db = admin.firestore();

// Esta es la nueva sintaxis para una función programada que se ejecuta cada 1 hora.
exports.releaseExpiredTickets = onSchedule("every 1 hours", async (event) => {
  console.log("Ejecutando la función para liberar boletos expirados...");

  const now = admin.firestore.Timestamp.now();
  const twentyFourHoursAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - (24 * 60 * 60 * 1000));

  // 1. Buscamos todos los boletos que estén "pending" y hayan sido reservados hace más de 24 horas.
  const query = db.collection("tickets")
    .where("status", "==", "pending")
    .where("reservationTimestamp", "<=", twentyFourHoursAgo);
  
  const snapshot = await query.get();

  if (snapshot.empty) {
    console.log("No hay boletos expirados para liberar.");
    return null;
  }

  // 2. Preparamos un lote para actualizarlos todos de una vez.
  const batch = db.batch();
  snapshot.forEach(doc => {
    console.log(`Liberando boleto #${doc.id}...`);
    const ticketRef = db.collection("tickets").doc(doc.id);
    batch.update(ticketRef, {
      status: "available",
      buyerName: null, // Limpiamos los datos del comprador temporal
      reservationTimestamp: null,
    });
  });

  // 3. Ejecutamos la actualización.
  await batch.commit();
  console.log(`Proceso completado. Se liberaron ${snapshot.size} boletos.`);
  return null;
});