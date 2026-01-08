import { relations } from 'drizzle-orm';
import * as schema from './schema';

export const profilesRelations = relations(schema.profiles, ({ many }) => ({
    portfolios: many(schema.portfolios),
    snapshots: many(schema.dailySnapshots),
    intradaySnapshots: many(schema.intradaySnapshots),
}));

export const portfoliosRelations = relations(schema.portfolios, ({ one, many }) => ({
    user: one(schema.profiles, {
        fields: [schema.portfolios.userId],
        references: [schema.profiles.id],
    }),
    institution: one(schema.institutions, {
        fields: [schema.portfolios.institutionId],
        references: [schema.institutions.id],
    }),
    assets: many(schema.assets),
}));

export const assetsRelations = relations(schema.assets, ({ one, many }) => ({
    portfolio: one(schema.portfolios, {
        fields: [schema.assets.portfolioId],
        references: [schema.portfolios.id],
    }),
    transactions: many(schema.transactions),
}));

export const intradaySnapshotsRelations = relations(schema.intradaySnapshots, ({ one }) => ({
    user: one(schema.profiles, {
        fields: [schema.intradaySnapshots.userId],
        references: [schema.profiles.id],
    }),
}));
