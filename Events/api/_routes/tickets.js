import connectToDatabase from "../lib/mongodb.js";
import { TicketPrice } from "../lib/models.js";

// Ensure CORS headers for the Admin Panel domain
const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();

    if (req.method === "GET") {
      // For now, focusing on the farewell_2024 event
      const eventId = req.query.eventId || "farewell_2024";
      let ticketData = await TicketPrice.findOne({ eventId });
      
      if (!ticketData) {
        // Return default pricing if none exists in the DB yet
        ticketData = { eventId, regularPrice: 1499, vipPrice: 2999 };
      }
      
      return res.status(200).json({ success: true, event: ticketData });
    }

    if (req.method === "POST") {
      const { eventId, regularPrice, vipPrice } = req.body;

      if (!eventId || regularPrice === undefined || vipPrice === undefined) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      // Upsert ticket pricing
      const ticketData = await TicketPrice.findOneAndUpdate(
        { eventId },
        { regularPrice, vipPrice },
        { new: true, upsert: true }
      );

      return res.status(200).json({ success: true, event: ticketData });
    }

    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  } catch (error) {
    console.error("Ticket API Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
