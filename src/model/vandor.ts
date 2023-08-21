import mongoose, { Schema, Document } from "mongoose";

interface vandorDoc extends Document {
    name: string;
    address: string; 
    pincode: string;
    foodType: [string];
    email: string;
    password: string;
    ownerName: string;
    phone: string;
    salt: string;
    serviceAvailable: boolean;
    coverImage: [string];
    rating: number;
    foods: any;
}

const vandorSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String },
    pincode: { type: String, required: true },
    foodType: { type: [String] },
    email: { type: String, required: true },
    password: { type: String, required: true },
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },
    salt: { type: String, required: true },
    serviceAvailable: { type: Boolean },
    coverImage: { type: [String] },
    rating: { type: Number },
    foods: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'food',
    }],
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

const vandor = mongoose.model<vandorDoc>('vandor', vandorSchema);

export { vandor };