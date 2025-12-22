export function buildBookingMessage({
  serviceName,
  packageName,
  delivery,
  revisions,
  clientName,
}: {
  serviceName: string;
  packageName: string;
  delivery: number;
  revisions: number;
  clientName: string;
}) {
  return `📢 New Order Placed

${clientName} has successfully placed an order for your service.

📌 Service: ${serviceName}
📦 Package: ${packageName}
⏱ Delivery Time: ${delivery} day(s)
🔁 Revisions: ${revisions}

You may now review the order details and request any required information from the client to begin the work.`;
}
