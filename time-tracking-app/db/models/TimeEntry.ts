import mongoose, { Schema } from 'mongoose';

export interface ITimeEntry extends Document {
    clockIn: Date;
    clockOut?: Date;
}

export const timeEntrySchema: Schema = new Schema({
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
});

const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', timeEntrySchema);

export default TimeEntry;
