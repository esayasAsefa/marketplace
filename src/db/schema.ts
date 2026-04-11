import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Users table synced via StackAuth webhook or manually
export const users = pgTable("users", {
  id: text("id").primaryKey(), // StackAuth User ID
  email: text("email").notNull().unique(),
  name: text("name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User profiles with marketplace specific details
export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  isPro: boolean("is_pro").default(false).notNull(),
  bio: text("bio"),
  phone: text("phone"),
});

// Services offered by Pros
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  proId: text("pro_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id", { length: 255 }).notNull(), // e.g. "plumbing", "cleaning"
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // stored in cents
  locationLat: numeric("location_lat"),
  locationLng: numeric("location_lng"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bookings/Appointments
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'accepted', 'completed', 'cancelled'
  scheduledDate: timestamp("scheduled_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Reviews left by customers
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
