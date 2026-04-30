import os
import sys
import json
import time
from http.server import BaseHTTPRequestHandler
from bson import ObjectId

# Ensure the current directory is in path for Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    from engine_core.models import Vehicle, ParkingLot
    from engine_core.database import get_db
except ImportError as e:
    print(f"[Critical] Import failed: {str(e)}")

class handler(BaseHTTPRequestHandler):
    def end_with_json(self, status, payload):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(payload, default=str).encode('utf-8'))

    def do_OPTIONS(self):
        self.end_with_json(200, {})

    def do_GET(self):
        # We can pass ?parkingId=... to get status of a specific lot
        try:
            db = get_db()
            if db is None:
                return self.end_with_json(503, {"error": "DATABASE_ERROR", "message": "Failed to connect to MongoDB"})

            # Optional: Find more detailed stats for admin
            parkings_count = db.parkings.count_documents({})
            bookings_count = db.bookings.count_documents({"status": "Confirmed"})

            self.end_with_json(200, {
                "status": "online",
                "message": "Python Engine connected to Global MongoDB Cluster",
                "stats": {
                    "total_locs": parkings_count,
                    "active_bookings": bookings_count
                }
            })
        except Exception as e:
            self.end_with_json(500, {"success": False, "error": str(e)})

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8')) if content_length > 0 else {}
            print(f"Engine Inbound Data: {data}")
            
            db = get_db()
            if db is None:
                return self.end_with_json(503, {"error": "DATABASE_ERROR"})

            action = data.get("action")
            
            if action == "status":
                p_id = data.get("parkingId")
                if not p_id:
                    return self.end_with_json(400, {"error": "MISSING_PARKING_ID"})
                
                # Fetch Parking Info
                p_doc = db.parkings.find_one({"_id": ObjectId(p_id)}) if len(p_id) == 24 else db.parkings.find_one({"ID": p_id})
                if not p_doc:
                    return self.end_with_json(404, {"error": "PARK_NOT_FOUND"})

                # Fetch Active Bookings
                pid_str = str(p_doc["_id"]) if "_id" in p_doc else p_doc["ID"]
                active_bookings = list(db.bookings.find({"parkingId": pid_str, "status": "Confirmed"}))
                
                # Initialize Engine for this lot
                engine = ParkingLot.from_db(p_doc, active_bookings)
                status = engine.get_status()
                
                self.end_with_json(200, {
                    "success": True,
                    "location": p_doc.get("Location"),
                    "total": status["total"],
                    "free": status["free"]
                })

            elif action == "park":
                # Real logic for starting a booking
                p_id = data.get("parkingId")
                license_number = data.get("license", "UNKNOWN")
                v_type = data.get("type", "CAR").upper()
                u_id = data.get("userId")
                amount = data.get("amount", "0")

                p_doc = db.parkings.find_one({"_id": ObjectId(p_id)}) if len(p_id) == 24 else db.parkings.find_one({"ID": p_id})
                if not p_doc:
                    return self.end_with_json(404, {"error": "PARK_NOT_FOUND"})

                pid_str = str(p_doc["_id"]) if "_id" in p_doc else p_doc.get("ID")
                active_bookings = list(db.bookings.find({"parkingId": pid_str, "status": "Confirmed"}))
                
                engine = ParkingLot.from_db(p_doc, active_bookings)
                vehicle = Vehicle(license_number, v_type)
                
                spot = engine.park_vehicle(vehicle)
                
                if spot:
                    # Logic: Create official DB booking
                    new_booking = {
                        "parkingId": pid_str,
                        "userId": u_id,
                        "ownerId": str(p_doc.get("owner")) if p_doc.get("owner") else None,
                        "locationName": p_doc.get("Location"),
                        "vehicleType": v_type,
                        "vehicleNumber": license_number,
                        "startTime": data.get("startTime"),
                        "endTime": data.get("endTime"),
                        "amount": str(amount),
                        "status": "Confirmed",
                        "date": time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime()),
                        "spotId": spot.spot_id, 
                        "createdAt": time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
                    }
                    result = db.bookings.insert_one(new_booking)
                    
                    self.end_with_json(200, {
                        "success": True,
                        "booking_id": str(result.inserted_id),
                        "spot_id": spot.spot_id,
                        "message": f"Spot {spot.spot_id} allocated via AI Engine."
                    })
                else:
                    self.end_with_json(400, {
                        "success": False, 
                        "error": "LOT_FULL", 
                        "message": "No suitable spot available for your vehicle size."
                    })
            else:
                self.end_with_json(400, {"success": False, "message": "Unknown engine action."})
                
        except Exception as e:
            self.end_with_json(500, {"success": False, "error": str(e)})
