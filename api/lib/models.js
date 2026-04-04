import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: String,
    googleId: String,
    uid: String, // From Events project
    picture: String, // From Events project
  },
  { timestamps: true }
);

const ownerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: String,
    googleId: String,
    role: { type: String, default: "owner" },
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: String, required: true },
    endDate: String,
    location: {
      name: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    images: [String],
    category: String,
    price: { type: Number, default: 0 },
    capacity: { type: Number, default: 0 },
    status: { type: String, default: 'draft', enum: ['draft', 'published', 'cancelled'] },
    organizerId: { type: String, default: null }, // UID of the event owner
    // Backward compatibility for old "Events" project fields
    name: String,
    venue: String,
    venueCity: String,
    attendees: String,
    image: String,
    badge: String
  },
  { timestamps: true }
);

const accessLogSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true },
    location: { type: String, default: "Main Entrance" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const waitlistSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const contactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    role: String,
    message: String,
  },
  { timestamps: true }
);

const parkingSchema = new mongoose.Schema(
  {
    ID: { type: String, default: null },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      default: null,
    },
    Location: { type: String, required: true },
    Latitude: { type: Number, required: true },
    Longitude: { type: Number, required: true },
    PricePerHour: { type: Number, default: null },
    TotalSlots: { type: Number, default: null, min: 0 },
    Type: { type: String, default: "Public Parking" },
    Authority: { type: String, default: "Public" },
    Zone: { type: String, default: null },
    Status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    parkingId: {
      type: String, // Allow both ObjectId and numeric IDs from seeded data
      required: true,
    },
    eventId: { type: String, default: null },
    transactionId: { type: String, default: null },
    ownerId: {
      type: String, // Allow both ObjectId and null/numeric IDs
      default: null,
    },
    userId: {
      type: String,
      default: null,
    },
    locationName: String,
    vehicleType: String,
    vehicleNumber: String,
    ticketId: { type: String, unique: true, sparse: true }, // Unique ID for QR code
    attended: { type: Boolean, default: false }, // Check-in status
    startTime: String,
    endTime: String,
    amount: String,
    status: { type: String, default: "Confirmed" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    discussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    text: { type: String, required: true, maxlength: 2000 },
    authorName: { type: String, required: true },
    authorPhoto: { type: String, default: "" },
    authorUid: { type: String, required: true },
    upvotes: { type: [String], default: [] },
    downvotes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const discussionSchema = new mongoose.Schema(
  {
    movieTitle: { type: String, required: true },
    movieId: { type: Number },
    moviePosterPath: { type: String, default: "" },
    review: { type: String, required: true, maxlength: 5000 },
    rating: { type: Number, min: 1, max: 5, required: true },
    authorName: { type: String, required: true },
    authorPhoto: { type: String, default: "" },
    authorUid: { type: String, required: true },
    upvotes: { type: [String], default: [] },
    downvotes: { type: [String], default: [] },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Owner = mongoose.models.Owner || mongoose.model("Owner", ownerSchema);
export const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
export const AccessLog = mongoose.models.AccessLog || mongoose.model("AccessLog", accessLogSchema);
export const Waitlist = mongoose.models.Waitlist || mongoose.model("Waitlist", waitlistSchema);
export const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
export const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
export const Discussion = mongoose.models.Discussion || mongoose.model("Discussion", discussionSchema);
export const Parking = mongoose.models.Parking || mongoose.model("Parking", parkingSchema);
export const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
