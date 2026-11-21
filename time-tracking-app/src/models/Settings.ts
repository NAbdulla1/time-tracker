import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
    timeZone: string;
    firstDayOfWeek: number;        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday (Default: 1)
    secondaryWeekStartDay: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday (Default: 1)
    secondaryWeekEnabled: boolean; // Default: true
    weeklyTargetHours: number;     // Default: 40
    createdAt: Date;
    updatedAt: Date;
}

export const settingsSchema: Schema = new Schema(
    {
        timeZone: { type: String, required: true, default: 'UTC' },
        firstDayOfWeek: { type: Number, required: true, default: 1, min: 0, max: 6 },
        secondaryWeekStartDay: { type: Number, required: true, default: 1, min: 0, max: 6 },
        secondaryWeekEnabled: { type: Boolean, required: true, default: true },
        weeklyTargetHours: { type: Number, required: true, default: 40, min: 1 },
    },
    { timestamps: true }
);

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

export default Settings;
