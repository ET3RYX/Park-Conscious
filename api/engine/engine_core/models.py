import time

class SpotType:
    SMALL = "SMALL"
    MEDIUM = "MEDIUM"
    LARGE = "LARGE"

class VehicleType:
    BIKE = "BIKE"
    CAR = "CAR"
    TRUCK = "TRUCK"

class Vehicle:
    def __init__(self, license_number, vehicle_type):
        self.license_number = license_number
        self.vehicle_type = vehicle_type

class ParkingSpot:
    def __init__(self, spot_id, spot_type):
        self.spot_id = str(spot_id)
        self.spot_type = spot_type
        self.is_occupied = False
        self.vehicle = None

    def is_free(self) -> bool:
        return not self.is_occupied

    def can_fit_vehicle(self, vehicle) -> bool:
        v_type = str(vehicle.vehicle_type).upper()
        
        # Robust mapping for frontend strings
        if v_type in ["BIKE", "2WHEELER"]:
            return True
        if v_type in ["CAR", "4WHEELER"]:
            return self.spot_type in [SpotType.MEDIUM, SpotType.LARGE]
        if v_type in ["TRUCK", "HEAVY"]:
            return self.spot_type == SpotType.LARGE
            
        # Default fallback (Most vehicles fit in Medium/Large)
        return self.spot_type in [SpotType.MEDIUM, SpotType.LARGE]

    def assign_vehicle(self, vehicle):
        if self.is_free() and self.can_fit_vehicle(vehicle):
            self.vehicle = vehicle
            self.is_occupied = True
            return True
        return False

    def remove_vehicle(self):
        self.vehicle = None
        self.is_occupied = False

class Level:
    def __init__(self, level_id, spots: list):
        self.level_id = level_id
        self.spots = spots

    def find_available_spot(self, vehicle):
        for spot in self.spots:
            if spot.is_free() and spot.can_fit_vehicle(vehicle):
                return spot
        return None

    def park_vehicle(self, vehicle):
        spot = self.find_available_spot(vehicle)
        if spot and spot.assign_vehicle(vehicle):
            return spot
        return None

    def free_spot(self, spot):
        spot.remove_vehicle()

    def get_available_spots_count(self):
        return sum(1 for spot in self.spots if spot.is_free())

class Ticket:
    def __init__(self, ticket_id, vehicle, parking_spot, entry_time):
        self.ticket_id = ticket_id
        self.vehicle = vehicle
        self.parking_spot = parking_spot
        self.entry_time = entry_time
        self.exit_time = None

    def close_ticket(self):
        self.exit_time = time.time()

class ParkingLot:
    def __init__(self, levels: list):
        self.levels = levels
        self.active_tickets = {}

    @classmethod
    def from_db(cls, parking_doc, active_bookings):
        """
        Factory method to create a ParkingLot state from MongoDB documents.
        Virtualizes spots based on TotalSlots. 
        Guarantees minimum capacity for demos/production robustness.
        """
        # If TotalSlots is 0 or missing, default to 20 for production-readiness demo
        total_slots = parking_doc.get("TotalSlots") or 20
        if total_slots <= 0:
            total_slots = 20
        
        # Virtualization: Ensure at least one of each major type if capacity allows
        num_small = max(1, int(total_slots * 0.2)) if total_slots >= 3 else 1
        num_large = max(1, int(total_slots * 0.2)) if total_slots >= 3 else 0
        num_medium = max(0, total_slots - num_small - num_large)
        
        spots = []
        for i in range(num_small):
            spots.append(ParkingSpot(f"S{i+1}", SpotType.SMALL))
        for i in range(num_medium):
            spots.append(ParkingSpot(f"M{i+1}", SpotType.MEDIUM))
        for i in range(num_large):
            spots.append(ParkingSpot(f"L{i+1}", SpotType.LARGE))
            
        level = Level("Main", spots)
        obj = cls([level])
        
        # Mark occupied spots by matching active bookings
        for booking in active_bookings:
            v_type = booking.get("vehicleType", "CAR")
            license = booking.get("vehicleNumber", "UNKNOWN")
            v = Vehicle(license, v_type)
            # Mark spot as occupied based on booking
            obj.park_vehicle(v)
            
        return obj

    def park_vehicle(self, vehicle):
        for level in self.levels:
            spot = level.park_vehicle(vehicle)
            if spot:
                return spot
        return None

    def get_status(self):
        total = 0
        free = 0
        for level in self.levels:
            total += len(level.spots)
            free += level.get_available_spots_count()
        return {"total": total, "free": free}
