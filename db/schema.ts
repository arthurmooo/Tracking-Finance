import { pgTable, text, timestamp, uuid, decimal, varchar, date, integer, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Profiles: User settings and preferences
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Institutions: Banks, brokers (e.g., Boursorama, Fortuneo)
export const institutions = pgTable('institutions', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    logoUrl: text('logo_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Portfolios: Containers for assets (e.g., PEA, Assurance Vie)
export const portfolios = pgTable('portfolios', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id).notNull(),
    institutionId: uuid('institution_id').references(() => institutions.id),
    name: text('name').notNull(),
    type: varchar('type', { length: 50 }).notNull(), // PEA, ASD, CASH, CRYPTO, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Assets: Individual holdings (Stocks, ETFs)
export const assets = pgTable('assets', {
    id: uuid('id').primaryKey().defaultRandom(),
    portfolioId: uuid('portfolio_id').references(() => portfolios.id).notNull(),
    symbol: text('symbol'), // Ticker or metadata (JSON for crowdfunding)
    name: text('name').notNull(),
    quantity: decimal('quantity').notNull(),
    averageBuyPrice: decimal('average_buy_price'),
    currentPrice: decimal('current_price'), // Cached latest price
    dividendYield: decimal('dividend_yield'), // Cached yield from Yahoo Finance
    currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
    type: varchar('type', { length: 20 }).notNull(), // STOCK, ETF, CASH, REAL_ESTATE
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Transactions: History of movements
export const transactions = pgTable('transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    assetId: uuid('asset_id').references(() => assets.id).notNull(),
    type: varchar('type', { length: 20 }).notNull(), // BUY, SELL, DIVIDEND, FEE
    amount: decimal('amount').notNull(), // Total value
    quantity: decimal('quantity'),
    pricePerUnit: decimal('price_per_unit'),
    fees: decimal('fees').default('0'),
    date: timestamp('date').notNull(),
    externalId: text('external_id').unique(), // For idempotency import
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Daily Snapshots: Historical net worth
export const dailySnapshots = pgTable('daily_snapshots', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id).notNull(),
    date: date('date').notNull(),
    totalNetWorth: decimal('total_net_worth').notNull(),
    currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
    data: jsonb('data'), // Stores breakdown e.g. { "stocks": 100, "crowdfunding": 50 }
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Intraday Snapshots: Hourly/Frequent historical net worth for granular charts
export const intradaySnapshots = pgTable('intraday_snapshots', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id).notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(), // Full timestamp
    totalNetWorth: decimal('total_net_worth').notNull(),
    currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
    data: jsonb('data'), // Stores breakdown e.g. { "stocks": 100, "crowdfunding": 50 }
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Crowdlending Projects: For participatory financing tracking
export const crowdlendingProjects = pgTable('crowdlending_projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    portfolioId: uuid('portfolio_id').references(() => portfolios.id).notNull(),
    name: text('name').notNull(),
    platform: text('platform').notNull(), // Bienprêter, October, etc.
    investedAmount: decimal('invested_amount').notNull(),
    interestRate: decimal('interest_rate').notNull(), // e.g., 10.5
    repaymentType: varchar('repayment_type', { length: 20 }).default('MONTHLY').notNull(), // MONTHLY, BULLET
    startDate: date('start_date').notNull(),
    durationMonths: integer('duration_months').notNull(),
    status: varchar('status', { length: 20 }).default('ACTIVE').notNull(), // ACTIVE, COMPLETED, DEFAULTED
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
