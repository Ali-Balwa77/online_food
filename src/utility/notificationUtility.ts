// Email

// Notification

// OTP
export const generateOtp = () => {

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date();
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000));

    return { otp, expiry };
}


export const onRequestOtp = async (otp: number, toPhoneNumber: string) => {
    
    const accountSid = 'ACc55edf76eda8febf05cab271178fc4fe';
    const authToken = '99e0ccee98d2095e63b84d4b52d55ee6';
    const client = require('twilio')(accountSid, authToken);

    const response = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: '+14706345307',
        to: `+91${toPhoneNumber}`,
    })

    return response;
}

 
// Payment notification and emails 