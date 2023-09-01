import mongoose, { Schema, Document } from "mongoose";

export interface offerDoc extends Document {
    offerType: string,
    vandors: [any],
    title: string,
    description: string,
    minValue: number,
    offerAmount: number,
    startValidity: Date,
    endValidity: Date,
    promoCode: string,
    promoType: string,
    bank: [any],
    bins: [any],
    pincode: string,
    isActive: boolean,
}

const offerSchema = new Schema({
    offerType: { type: String, required: true },
    vandors: [
        {
            type: Schema.Types.ObjectId, ref: 'vandor',
        }
    ],
    title: { type: String, required: true },
    description: { type: String },
    minValue: { type: Number, required: true },
    offerAmount: { type: Number, required: true },
    startValidity: { type: Date },
    endValidity: { type: Date },
    promoCode: { type: String, required: true },
    promoType: { type: String, required: true },
    bank: [        
        { type: String },
    ],
    bins: [
        { type: Number },
    ],
    pincode: { type: String, required: true },
    isActive: { type: Boolean },
},
{
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true,
})

const Offer = mongoose.model<offerDoc>('offer', offerSchema);

export { Offer };