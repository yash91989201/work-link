import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  email_verified: boolean("email_verified").notNull(),
  image: text("image"),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expires_at: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id),
  active_organization_id: text("active_organization_id"),
  active_team_id: text("active_team_id"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  account_id: text("account_id").notNull(),
  provider_id: text("provider_id").notNull(),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id),
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),
  id_token: text("id_token"),
  access_token_expires_at: timestamp("access_token_expires_at"),
  refresh_token_expires_at: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at"),
  updated_at: timestamp("updated_at"),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  created_at: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id),
  role: text("role").notNull(),
  created_at: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  inviter_id: text("inviter_id")
    .notNull()
    .references(() => user.id),
  updated_at: timestamp("updated_at").notNull(),
});

export const team = pgTable("team", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id),
  created_at: timestamp("created_at").notNull(),
});

export const teamMember = pgTable("team_member", {
  id: text("id").primaryKey(),
  team_id: text("team_id")
    .notNull()
    .references(() => team.id),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id),
  role: text("role").notNull(),
  created_at: timestamp("created_at").notNull(),
});
