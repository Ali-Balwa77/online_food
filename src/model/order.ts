import mongoose, { Schema, Document } from "mongoose";

export interface orderDoc extends Document {
    orderID: string,
    vandorId: string,
    items: [any],
    totalAmount: number,
    paidAmount: number,
    orderDate: Date,
    orderStatus: string,
    remarks: string,
    deliveryId: string,
    readyTime: number,
}

const orderSchema = new Schema({
    orderID: { type: String, required: true },
    vandorId: { type: String, required: true },
    items: [
        {
            food: { type: Schema.Types.ObjectId, ref: 'food', required: true },
            unit: { type: Number, required: true },
        }
    ],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    orderDate: { type: Date },
    orderStatus: { type: String },
    remarks: { type: String },
    deliveryId: { type: String },
    readyTime: { type: Number },
},
{
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true,
})

const Order = mongoose.model<orderDoc>('order', orderSchema);

export { Order };