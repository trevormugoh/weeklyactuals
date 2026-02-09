'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

const DB_NAME = process.env.MONGODB_DB || 'weekly_actuals';
const COLLECTION_NAME = 'actuals';

export async function getActuals() {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const actuals = await db.collection(COLLECTION_NAME).find({}).toArray();
        return actuals.map(doc => ({
            id: doc._id.toString(),
            week: doc.week,
            kpiId: doc.kpiId,
            regionName: doc.regionName,
            actual: doc.actual
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function saveActual(week: number, kpiId: string, regionName: string, actual: number) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);

        await db.collection(COLLECTION_NAME).updateOne(
            { week, kpiId, regionName },
            { $set: { actual, updatedAt: new Date() } },
            { upsert: true }
        );

        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Failed to save' };
    }
}
