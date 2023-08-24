import mongoose, { Schema, Document } from "mongoose";

export interface orderDoc extends Document {
    orderID: string,
    items: [any],
    totalAmount: number,
    orderDate: Date,
    paidThrogh: string,
    paymentResponse: string,
    orderStatus: string,
}

const orderSchema = new Schema({
    orderID: { type: String, required: true },
    items: [
        {
            food: { type: Schema.Types.ObjectId, ref: 'food', required: true },
            unit: { type: Number, required: true },
        }
    ],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date },
    paidThrogh: { type: String },
    paymentResponse: { type: String },
    orderStatus: { type: String },
},
{
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true,
})

const order = mongoose.model<orderDoc>('order', orderSchema);

export { order };