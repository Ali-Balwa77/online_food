import { VendorPayload } from './vandor.dto'
import { CustomerPayload } from './customer.dto';

export type AuthPayload = VendorPayload | CustomerPayload;